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
    wind.$$ = wind.vRest = $$;
})(window);