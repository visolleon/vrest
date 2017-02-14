# VREST

Ajax Restful 库

## 配置Host

```
// 配置Host
$$.config({
    host: "http://www.happyseven.cn:8080"
});
```

## 注册Meta信息

### 注册Get请求Meta
```
$$.register({
    init: {
        url: "base/init",
        methods: ['GET']
    }
});
```

或者
```
vRest.register({
    init: {
        url: "base/init",
        methods: ['GET']
    }
});
```

注册后便生成一个Ajax请求函数，使用方式：

```
$$.init().ok(function (data) {
    console.log(data);
});
```

### 注册带参数的Meta

```
$$.register({
    info: {
        url: "base/info",
        params: {
            id: {type: "string", default: "123"}
        },
        methods: ['GET']
    }
});
```

使用方式：

```
$$.info("xxx").ok(function (data) {
    console.log(data);
});
```

### 注册REST API的Meta

```
$$.register({
    info: {
        url: "base/info",
        params: {
            id: {type: "string", default: "123"}
        },
        methods: ['GET', 'POST', 'UPDATE', 'DELETE']
    }
});
```

使用方式：

```
// 普通方式，使用默认的method或者是META中的第一个method方式发送请求
$$.info("xxx").ok(function (data) {
    console.log(data);
});

// 自主调用REST API
// GET 请求
$$.info.get("xxx").ok(function (data) {
    console.log(data);
});

// POST请求
$$.info.post("xxx").ok(function (data) {
    console.log(data);
});

// UPDATE请求
$$.info.update("xxx").ok(function (data) {
    console.log(data);
});

// DELETE请求
$$.info.delete("xxx").ok(function (data) {
    console.log(data);
});
```

### 注册预检查的Meta

```
$$.register({
    info: {
        url: "base/info",
        check: function () {
            if(!this.id) {
                console.error("id can't be null.");
            }
        },
        params: {
            id: {type: "string", default: "123"}
        },
        methods: ['GET']
    }
});
```

### 注册请求成功后数据经过处理后返回

```
$$.register({
    info: {
        url: "base/info",
        check: function () {
            if(!this.id) {
                console.error("id can't be null.");
            }
        },
        params: {
            id: {type: "string", default: "123"}
        },
        run: function (data) {
            if(data.stauts == 1) {
                return data;
            } else {
                console.error("数据返回错误");
            }
        },
        methods: ['GET']
    }
});
```

### 注册数据缓存的Meta
```
$$.register({
    info: {
        url: "base/info",
        cache: true,
        timeout: 60 * 1000, // 缓存超时设置
        autoUpdate: true,
        params: {
            id: {type: "string", default: "123"}
        },
        methods: ['GET']
    }
});
```
当第一次请求后，会根据参数的设置来进行缓存，以后的请求都会返回缓存；
设置timeout后，超时后缓存会自动失效，如果未设置autoUpdate，则下一次请求会通过Ajax请求数据再更新缓存；如果设置autoUpdate为true，则超时后会自动请求数据并使用最新数据更新缓存。

### 清除缓存

```
// 直接清除缓存
$$.info.clear();
// 或者
$$.info().clear();

// 清除后再更新缓存
$$.info.clear().exec().ok(function (data) {
    console.log(data);
});
```

## 注册函数方法
使用Meta注册函数的方法有：

before: 执行前执行的方法。
ok: 执行成功后处理数据，得到数据，如果Meta处理了run方法，则返回run方法的结果，如果未处理，则直接返回Ajax请求数据。
success: 执行成功后返回Ajax请求得到的数据。
error: Ajax请求发生错误时执行。
complete: 请求结束后执行。
clear: 清除缓存数据。
exec: 执行请求。

示例：
```
$$.info.clear().exec().before(function () {
    console.log("before ajax");
}).ok(function (data) {
    console.log("ok:", data);
}).success(function (data) {
    console.log("success:", data);
}).complete(function () {
    console.log("ajax complete");
}).error(function () {
    console.error("ajax error");
});
```