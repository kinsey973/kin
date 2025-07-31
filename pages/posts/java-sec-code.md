---
title: java-sec-code
date: 2024-11-26 20:58:52
tags: java
categories: 学习笔记
---

靶场需访问http://localhost:8080/index

默认账号密码为admin admin123

题目在源码里（亏我找半天）

### RCE

#### 1. /rce/runtime/exec

```java
@GetMapping("/runtime/exec")
    public String CommandExec(String cmd) {
        Runtime run = Runtime.getRuntime();
        StringBuilder sb = new StringBuilder();

        try {
            Process p = run.exec(cmd);
            BufferedInputStream in = new BufferedInputStream(p.getInputStream());
            BufferedReader inBr = new BufferedReader(new InputStreamReader(in));
            String tmpStr;

            while ((tmpStr = inBr.readLine()) != null) {
                sb.append(tmpStr);
            }

            if (p.waitFor() != 0) {
                if (p.exitValue() == 1)
                    return "Command exec failed!!";
            }

            inBr.close();
            in.close();
        } catch (Exception e) {
            return e.toString();
        }
        return sb.toString();
    }

```

**命令执行**：通过调用 `Runtime.getRuntime().exec(cmd)` 执行传入的命令，这会启动一个新的子进程来执行该命令。

**输入流处理**：使用 `BufferedInputStream` 和 `BufferedReader` 从子进程的标准输出流中读取命令执行的结果。这些结果会被累积到一个 `StringBuilder` 中。

**异常捕获**：如果执行过程中发生异常，捕获并返回异常的字符串描述。

**退出码处理**：在命令执行完成后，检查子进程的退出码。如果退出码不为零且为 1，则表示命令执行失败。

**返回结果**：如果命令执行成功，返回命令的输出内容；如果发生错误，则返回错误信息。



我们可以通过Runtime.getRuntime()这个方法来进行命令执行，在该代码里它通过传入cmd变量进行命令执行

```
?cmd=whoami
```

![image-20241206200351163](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202412062003249.png)

#### 2./rce/ProcessBuilder

```java
 @GetMapping("/ProcessBuilder")
    public String processBuilder(String cmd) {
        StringBuilder sb = new StringBuilder();
        try {
            String[] arrCmd = {"/bin/sh", "-c", cmd};
            ProcessBuilder processBuilder = new ProcessBuilder(arrCmd);
            Process p = processBuilder.start();
            BufferedInputStream in = new BufferedInputStream(p.getInputStream());
            BufferedReader inBr = new BufferedReader(new InputStreamReader(in));
            String tmpStr;

            while ((tmpStr = inBr.readLine()) != null) {
                sb.append(tmpStr);
            }
        } catch (Exception e) {
            return e.toString();
        }

        return sb.toString();
    }

```

**命令执行**： `String[] arrCmd = {"/bin/sh", "-c", cmd};`
通过 `ProcessBuilder` 启动一个新的 shell 进程，执行传入的命令 `cmd`。这里使用 `-c` 选项告诉 shell 执行字符串中的命令。

**启动进程**： `Process p = processBuilder.start();`
启动进程后，获取该进程的标准输出流并读取其内容。

**读取输出**： 通过 `BufferedInputStream` 和 `BufferedReader` 逐行读取进程的输出并存储在 `StringBuilder` 中。

**异常处理**： 如果命令执行失败或抛出异常，会返回异常的字符串表示。



该代码通过get请求传入一个cmd，然后利用ProcessBuilder这个类调用系统进程来命令执行

注意，在windows系统里

```
String[] arrCmd = {"cmd.exe", "/c", cmd};
```

我们需要在源代码中修改，不然命令执行会报错



![image-20241206202436880](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202412062024910.png)

#### 3./rce/jscmd

```java
    @GetMapping("/jscmd")
    public void jsEngine(String jsurl) throws Exception{
        // js nashorn javascript ecmascript
        ScriptEngine engine = new ScriptEngineManager().getEngineByName("js");
        Bindings bindings = engine.getBindings(ScriptContext.ENGINE_SCOPE);
        String cmd = String.format("load(\"%s\")", jsurl);
        engine.eval(cmd, bindings);
    }
```

