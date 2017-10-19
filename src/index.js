(function () {
    var remote = window.$$ || {};
    var config = remote._config;

    var MetaClass = function (meta) {
        var t = this;

        this._op = {};
        this.meta = meta;

        // 数据缓存 
        this.meta._cacheData = this.meta._cacheData || {};

        // 执行
        this.exec = function (argParam) {
            var arg = arguments;
            var params = {};
            var meta = t.meta || {};

            if (argParam && argParam.constructor == Object) {
                params = argParam;
            } else {
                var i = 0;
                for (var k in meta.params) {
                    params[k] = arg[i];
                    if (arg[i] == undefined || arg[i] == null) {
                        params[k] = meta.params[k].default;
                    } else if (meta.params[k].type == "int") {
                        var val = parseInt(arg[i]);
                        if (val == NaN) {
                            console.warn("param", k, "is not integer.");
                        }
                    }
                    i++;
                }
            }
            var method = this.method;
            if (!method) {
                method = (meta.methods && meta.methods.length > 0) ? meta.methods[0] : 'GET';
            }
            var url = meta.url || '';

            var dataKay = JSON.stringify(params);

            var ret = null;
            if (meta.check) {
                ret = meta.check.apply(params, null);
            } else if (meta.cache) {
                ret = t.meta._cacheData[dataKay];
                if (ret && meta.run) {
                    ret = meta.run.call(t, ret);
                }
            }

            if (typeof ret == "boolean" && !ret) {
                return t;
            } else if (ret instanceof Object) {
                if (t._op.ok || t._op.success) {
                    t._op.before && t._op.before.apply(params, null);
                    t._op.ok && t._op.ok.call(t, ret);
                    t._op.success && t._op.success.call(t, {
                        "return": ret,
                        status: 1
                    });
                    t._op.complete && t._op.complete();
                } else {
                    setTimeout(function () {
                        t._op.before && t._op.before.apply(params, null);
                        t._op.ok && t._op.ok.call(t, ret);
                        t._op.success && t._op.success.call(t, {
                            "return": ret,
                            status: 1
                        });
                        t._op.complete && t._op.complete();
                    }, 0);
                }
                return t;
            }

            url = url.split('/').map(function (x) {
                if (x[0] == ":") {
                    var xn = x.slice(1);
                    var xv = params[xn];
                    if (xv) {
                        delete params[xn];
                        return xv;
                    }
                }
                return x;
            }).join('/');

            setTimeout(function () {
                t._op.before && t._op.before.apply(params, null);

                // var act = (method == 'POST') ? config.server.post : config.server.get;

                config.server.ajax({
                    path: url,
                    type: method,
                    data: params,
                    success: function (data) {
                        t._op.success && t._op.success.call(t, data);
                        var ret = data;
                        if (meta.cache) {
                            t.meta._cacheData[dataKay] = data;
                            // 超时更新
                            if (meta.timeout) {
                                var timeout = parseInt(meta.timeout) || 60 * 1000 * 5;
                                setTimeout(function () {
                                    var c = new MetaClass(meta)
                                    c.clear();
                                    var argsArr = [];
                                    if (meta.autoUpdate) {
                                        for (var k in params) {
                                            argsArr.push(params[k]);
                                        }
                                        c.exec.apply(t, argsArr);
                                    }
                                }, timeout);
                            }
                        }
                        if (meta.run) {
                            ret = meta.run.call(t, data);
                        }
                        t._op.ok && t._op.ok.call(t, ret);
                    },
                    error: function (xhr) {
                        t._op.error && t._op.error(xhr.status, xhr.responseJSON, params);
                    },
                    complete: function () {
                        t._op.complete && t._op.complete();
                    }
                });
            }, 0);
            return t;
        };

        // 清理缓存数据
        this.clear = function () {
            this.meta._cacheData = {};
            return this;
        };


        // // 缓存当前设置的回调处理
        // this.cache = function () {
        //     this._isCache = true;
        //     return this;
        // };

        // // 清除之前的设置
        // this.clearCache = function () {
        //     this._op = {};
        //     this._isCache = false;
        //     return this;
        // };

        // 发送前处理
        this.before = function (cb) {
            this._op.before = cb;
            return this;
        };

        // 运行成功数据未经过处理
        this.success = function (cb) {
            this._op.success = cb;
            return this;
        };

        // 取得数据经过处理后
        this.ok = function (cb) {
            this._op.ok = cb;
            return this;
        };

        // 获取失败
        this.error = function (cb) {
            this._op.error = cb;
            return this;
        };

        // 完成
        this.complete = this.end = function (cb) {
            this._op.complete = cb;
            return this;
        };

        return this;
    };

    var __metaCall = function (remote, key, meta) {
        Object.defineProperty(remote, key, {
            get: function () {
                var c = new MetaClass(meta);
                var fn = function () {
                    c.method = null;
                    return this.exec.apply(this, arguments);
                }.bind(c);

                // 清除缓存
                fn.clear = function () {
                    c.meta._cacheData = {};
                    return c
                };
                fn.before = c.before.bind(c);
                fn.ok = c.ok.bind(c);
                fn.complete = c.complete.bind(c);
                fn.error = c.error.bind(c);

                // 生成REST API
                meta.methods = meta.methods || ["GET"];
                for (var i = 0; i < meta.methods.length; i++) {
                    var m = meta.methods[i];
                    if (m) {
                        m = m.toLocaleLowerCase();
                        (function (m) {
                            fn[m] = function () {
                                c.method = m;
                                return this.exec.apply(this, arguments);
                            }.bind(c);
                        })(m);
                    }
                }
                return fn;
            },
            set: function () {
                console.error("redefine function:", key);
            }
        });
    };

    // 注册Meta
    remote.register = function (metas) {
        for (var key in metas) {
            if (!remote[key]) {
                if (metas[key] instanceof Function) {
                    remote[key] = metas[key];
                } else {
                    __metaCall(remote, key, metas[key]);
                }
            } else {
                console.warn("duplicate meta register:", key);
            }
        }
    };

    // 注册Model的Meta
    remote.registerSingle = function (key, meta) {
        if (!remote[key]) {
            __metaCall(remote, key, meta);
        } else {
            console.warn("duplicate meta register:", key);
        }
    };

    // URL处理
    remote.url = {

        queryString: document.location.search,

        // 查询Key值
        query: function (key) {
            return decodeURIComponent((this.queryString.match(new
                RegExp("(?:^\\?|&)" + key + "=(.*?)(?=&|$)")) || ['', ''])[1]);
        }
    };

    // 本地缓存
    remote.cache = {
        storage: window.localStorage,

        // 设置缓存数据
        set: function (name, data) {
            var str = data;
            if (typeof str != "string") {
                str = JSON.stringify(data)
            }
            if (this.storage) {
                this.storage.setItem(name, str);
            } else {
                var exdate = new Date();
                exdate.setDate(exdate.getDate() + 30);
                document.cookie = name + "=" + escape(str) + ";expires=" + exdate.toGMTString();// + ";path=/";
            }
        },

        // 清除缓存数据
        remove: function (name) {
            if (this.storage) {
                this.storage.removeItem(name);
            } else {
                var exdate = new Date();
                exdate.setDate(exdate.getDate() - 1);
                document.cookie = name + "=1;expires=" + exdate.toGMTString() + ";path=/";
            }
        },

        // 获取缓存数据
        get: function (name) {
            var data = '';
            if (this.storage) {
                data = this.storage.getItem(name);
            } else {
                if (document.cookie.length > 0) {
                    var start = document.cookie.indexOf(name + "=")
                    if (start != -1) {
                        start = start + name.length + 1
                        var end = document.cookie.indexOf(";", start)
                        if (end == -1) {
                            end = document.cookie.length
                        }
                        data = unescape(document.cookie.substring(start, end))
                    }
                }
            }
            if (data) {
                try {
                    return JSON.parse(data);
                } catch (e) {
                    console.warn("cache data is not json:", name, data);
                }
            }
            return data;
        }
    };

    window.$$ = window.vRest = remote;
})();