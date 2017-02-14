(function () {
    var _meta = {};

    //----------------初始化--------------------
    var _initData = null;
    // 手动Cache使用方式
    _meta.init = {
        url: "base/init",
        params: {},
        check: function () {
            if (_initData) {
                return _initData;
            }
        },
        methods: ['GET', 'POST'],
        run: function (data) {
            if (data.status == 1 && data["return"]) {
                _initData = data["return"];
                return _initData;
            } else {
                console.error("加载基础资源", data.message);
            }
        }
    };

    // 发送数据前预检查
    _meta.login = {
        url: "user/login",
        check: function () {
            if (!this.user) {
                console.log("user can't be null.");
                return false;
            } else if (!this.pass) {
                console.log("pass can't be null.")
                return false;
            }
            return true;
        },
        params: {
            user: { type: 'string', default: 'test11', desc: '登录用户名' },
            pass: { type: 'string', default: '123456', desc: '登录密码' }
        },
        methods: ['POST']
    };

    // cache model
    _meta.userInfo = {
        url: "user/get",
        params: {},
        cache: true,
        methods: ['POST'],
        run: function (data) {
            if (data.status == 1 && data["return"]) {
                return data["return"];
            } else {
                console.error(data.message);
            }
        }
    };

    _meta.userScenes = {
        url: 'scenes/getuser',
        params: {},
        methods: ['POST', 'GET'],
        cache: true,
        run: function (data) {
            if (data.status == 1 && data["return"]) {
                return data["return"];
            } else {
                console.error(data.message);
            }
        }
    };

    // auto upadte
    _meta.userInit = {
        url: "user/init",
        cache: true,
        timeout: 10 * 60 * 1000,
        autoUpdate: true,
        params: {},
        methods: ['POST', 'GET'],
        run: function (data) {
            if (data.status == 1 && data["return"]) {
                return data["return"];
            } else {
                console.error(data.message);
            }
        }
    };

    // config host
    $$.config({
        host: "http://www.happyseven.cn"
    });

    // register Meta
    $$.register(_meta);

    // How to use:
    $$.userInit().ok(function (data) {
        showLog("Init Ajax OK");
        console.log(data);
    });
})();