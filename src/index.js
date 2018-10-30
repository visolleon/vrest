(function (wind) {

    var $$ = wind.$$ || {};
    var remoteConfig = {};

    remoteConfig._config = {
        host: "",
        // 是否跨域
        crossDomain: true,
        // 通用发送的数据
        data: []
    };

    $$.config = function (c) {
        for (var k in c) {
            remoteConfig._config[k] = c[k];
        }
    };

    remoteConfig.server = {};

    var wx = wind.wx;

    var ajax = function (p) {
        if (!p.url) {
            console.error("url is invalid.");
            return;
        }
        p.type = (p.type || "get").toUpperCase();
        if (p.type == 'POST') {
            p.type = 'POST';
        } else if (p.type == 'UPDATE') {
            p.type = 'UPDATE';
        } else if (p.type == 'DELETE') {
            p.type = "DELETE";
        } else if (p.type == 'PUT') {
            p.type = 'PUT';
        } else {
            p.type = 'GET';
        }

        if (p.beforeSend) {
            p.beforeSend();
        }

        p.dataType = (p.dataType || "json").toLowerCase();
        p.headers = {};
        if (!p.headers["Content-Type"] && p.type != "GET") {
            if (p.dataType == "json") {
                p.headers["Content-Type"] = "application/x-www-form-urlencoded";
            } else {
                p.headers["Content-Type"] = "text/plain";
            }
        }
        // p.headers["Accept"] = "application/json, text/javascript, */*";

        // if (!p.crossDomain && !p.headers["X-Requested-With"]) {
        //     p.headers["X-Requested-With"] = "XMLHttpRequest";
        // }

        if (wx && wx.request) {
            if (remoteConfig._config.data) {
                for (var k in remoteConfig._config.data) {
                    var keyDate = remoteConfig._config.data[k];
                    if (typeof keyDate == "function") {
                        p.data[k] = keyDate();
                    } else {
                        p.data[k] = keyDate;
                    }
                }
            }
            wx.request({
                url: p.url,
                data: p.data,
                method: p.type,
                dataType: p.dataType,
                header: p.headers,
                success: function (d) {
                    p.success && p.success(d.data);
                },
                fail: p.error,
                complete: p.complete
            });
        } else {
            var xhr = new XMLHttpRequest();
            if (p.async != false) {
                p.async = true;
            }
            xhr.timeout = p.timeout;
            xhr.ontimeout = function () {
                p.ontimeout && p.ontimeout.apply(this, arguments);
            };

            xhr.onerror = p.error;

            xhr.onload = function (e) {
                var xhr = e.currentTarget;
                if (xhr.status == 200) {
                    if (p.dataType == "json") {
                        var jdata = JSON.parse(xhr.response);
                        p.success && p.success(jdata);
                    } else {
                        p.success && p.success(xhr.response);
                    }
                } else {
                    p.error && p.error(xhr, p);
                }
                p.complete && p.complete();
            };

            var sendData = [];
            for (var k in p.data) {
                sendData.push([k, p.data[k]].join("="));
            }
            // 设置通用数据
            if (remoteConfig._config.data) {
                for (var k in remoteConfig._config.data) {
                    var keyDate = remoteConfig._config.data[k];
                    if (typeof keyDate == "function") {
                        sendData.push([k, keyDate()].join("="));
                    } else {
                        sendData.push([k, keyDate].join("="));
                    }
                }
            }

            if (p.type == "GET") {
                if (p.url.indexOf("?") > -1) {
                    p.url += "&" + sendData.join("&");
                } else {
                    p.url += "?" + sendData.join("&");
                }
            }
            xhr.open(p.type, p.url, p.async);
            // xhr.open(p.type, p.url);

            for (var k in p.headers) {
                xhr.setRequestHeader(k, p.headers[k]);
            }
            if (p.xhrFields) {
                for (var n in p.xhrFields) {
                    xhr[n] = p.xhrFields[n];
                }
            }
            if (p.type == "GET") {
                xhr.send();
            } else {
                xhr.send(sendData.join("&"));
            }
        }
    };


    remoteConfig.server.onerror = null;

    /**
     * AJAX传输数据
     * @param data
     * @private
     */
    remoteConfig.server.ajax = function (data) {
        var params = {
            url: [remoteConfig._config.host, '/', data.path].join(''),
            data: data.data,
            dataType: data.dataType || 'json',
            type: data.type || "GET",
            success: function () {
                data.success && data.success.apply(this, arguments);
            },
            error: function () {
                data.error && data.error.apply(this, arguments);
                remoteConfig.server.onerror && remoteConfig.server.onerror.apply(this, arguments);
            },
            complete: function () {
                data.complete && data.complete.apply(this, arguments);
            }
        };

        if (remoteConfig._configcrossDomain) {
            params.xhrFields = {
                withCredentials: true
            };
            params.crossDomain = true;
        }
        ajax(params);
    };

    /**
     * 获取数据
     * @param path
     * @param data
     * @param success
     * @param error
     * @param complete
     */
    remoteConfig.server.get = function (path, data, success, error, complete) {
        var params = {
            path: path,
            type: "GET",
            data: data,
            success: success,
            error: error,
            complete: complete
        };
        remoteConfig.server.ajax(params);
    };

    /**
     * 发送数据
     * @param path
     * @param data
     * @param success
     * @param error
     * @param complete
     */
    remoteConfig.server.post = function (path, data, success, error, complete) {
        var params = {
            path: path,
            type: "POST",
            data: data,
            success: success,
            error: error,
            complete: complete
        };
        remoteConfig.server.ajax(params);
    };

    /**
     * 发送数据
     * @param path
     * @param data
     * @param success
     * @param error
     * @param complete
     */
    remoteConfig.server.send = function (path, type, data, success, error, complete) {
        var params = {
            path: path,
            type: type,
            data: data,
            success: success,
            error: error,
            complete: complete
        };
        remoteConfig.server.ajax(params);
    };

    $$._config = remoteConfig;
    
    var config = $$._config;

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

    var __metaCall = function ($$, key, meta) {
        Object.defineProperty($$, key, {
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
    $$.register = function (metas) {
        for (var key in metas) {
            if (!$$[key]) {
                if (metas[key] instanceof Function) {
                    $$[key] = metas[key];
                } else {
                    __metaCall($$, key, metas[key]);
                }
            } else {
                console.warn("duplicate meta register:", key);
            }
        }
    };

    // 注册Model的Meta
    $$.registerSingle = function (key, meta) {
        if (!$$[key]) {
            __metaCall($$, key, meta);
        } else {
            console.warn("duplicate meta register:", key);
        }
    };

    // URL处理
    $$.url = {

        queryString: document ? (document.location ? document.location.search : "") : "",

        // 查询Key值
        query: function (key) {
            return decodeURIComponent((this.queryString.match(new RegExp("(?:^\\?|&)" + key + "=(.*?)(?=&|$)")) || ['', ''])[1]);
        }
    };

    // 本地缓存
    $$.cache = {
        storage: wind.localStorage,

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
                document.cookie = name + "=" + escape(str) + ";expires=" + exdate.toGMTString(); // + ";path=/";
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

    wind.$$ = wind.VRest = $$;
    if (module) {
        module.exports = $$;
    }
})(window || {});