var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
var init_utils = __esm({
  "node_modules/unenv/dist/runtime/_internal/utils.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    __name(createNotImplementedError, "createNotImplementedError");
    __name(notImplemented, "notImplemented");
    __name(notImplementedClass, "notImplementedClass");
  }
});

// node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin, _performanceNow, nodeTiming, PerformanceEntry, PerformanceMark, PerformanceMeasure, PerformanceResourceTiming, PerformanceObserverEntryList, Performance, PerformanceObserver, performance;
var init_performance = __esm({
  "node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_utils();
    _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
    _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
    nodeTiming = {
      name: "node",
      entryType: "node",
      startTime: 0,
      duration: 0,
      nodeStart: 0,
      v8Start: 0,
      bootstrapComplete: 0,
      environment: 0,
      loopStart: 0,
      loopExit: 0,
      idleTime: 0,
      uvMetricsInfo: {
        loopCount: 0,
        events: 0,
        eventsWaiting: 0
      },
      detail: void 0,
      toJSON() {
        return this;
      }
    };
    PerformanceEntry = class {
      static {
        __name(this, "PerformanceEntry");
      }
      __unenv__ = true;
      detail;
      entryType = "event";
      name;
      startTime;
      constructor(name, options) {
        this.name = name;
        this.startTime = options?.startTime || _performanceNow();
        this.detail = options?.detail;
      }
      get duration() {
        return _performanceNow() - this.startTime;
      }
      toJSON() {
        return {
          name: this.name,
          entryType: this.entryType,
          startTime: this.startTime,
          duration: this.duration,
          detail: this.detail
        };
      }
    };
    PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
      static {
        __name(this, "PerformanceMark");
      }
      entryType = "mark";
      constructor() {
        super(...arguments);
      }
      get duration() {
        return 0;
      }
    };
    PerformanceMeasure = class extends PerformanceEntry {
      static {
        __name(this, "PerformanceMeasure");
      }
      entryType = "measure";
    };
    PerformanceResourceTiming = class extends PerformanceEntry {
      static {
        __name(this, "PerformanceResourceTiming");
      }
      entryType = "resource";
      serverTiming = [];
      connectEnd = 0;
      connectStart = 0;
      decodedBodySize = 0;
      domainLookupEnd = 0;
      domainLookupStart = 0;
      encodedBodySize = 0;
      fetchStart = 0;
      initiatorType = "";
      name = "";
      nextHopProtocol = "";
      redirectEnd = 0;
      redirectStart = 0;
      requestStart = 0;
      responseEnd = 0;
      responseStart = 0;
      secureConnectionStart = 0;
      startTime = 0;
      transferSize = 0;
      workerStart = 0;
      responseStatus = 0;
    };
    PerformanceObserverEntryList = class {
      static {
        __name(this, "PerformanceObserverEntryList");
      }
      __unenv__ = true;
      getEntries() {
        return [];
      }
      getEntriesByName(_name, _type) {
        return [];
      }
      getEntriesByType(type) {
        return [];
      }
    };
    Performance = class {
      static {
        __name(this, "Performance");
      }
      __unenv__ = true;
      timeOrigin = _timeOrigin;
      eventCounts = /* @__PURE__ */ new Map();
      _entries = [];
      _resourceTimingBufferSize = 0;
      navigation = void 0;
      timing = void 0;
      timerify(_fn, _options) {
        throw createNotImplementedError("Performance.timerify");
      }
      get nodeTiming() {
        return nodeTiming;
      }
      eventLoopUtilization() {
        return {};
      }
      markResourceTiming() {
        return new PerformanceResourceTiming("");
      }
      onresourcetimingbufferfull = null;
      now() {
        if (this.timeOrigin === _timeOrigin) {
          return _performanceNow();
        }
        return Date.now() - this.timeOrigin;
      }
      clearMarks(markName) {
        this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
      }
      clearMeasures(measureName) {
        this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
      }
      clearResourceTimings() {
        this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
      }
      getEntries() {
        return this._entries;
      }
      getEntriesByName(name, type) {
        return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
      }
      getEntriesByType(type) {
        return this._entries.filter((e) => e.entryType === type);
      }
      mark(name, options) {
        const entry = new PerformanceMark(name, options);
        this._entries.push(entry);
        return entry;
      }
      measure(measureName, startOrMeasureOptions, endMark) {
        let start;
        let end;
        if (typeof startOrMeasureOptions === "string") {
          start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
          end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
        } else {
          start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
          end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
        }
        const entry = new PerformanceMeasure(measureName, {
          startTime: start,
          detail: {
            start,
            end
          }
        });
        this._entries.push(entry);
        return entry;
      }
      setResourceTimingBufferSize(maxSize) {
        this._resourceTimingBufferSize = maxSize;
      }
      addEventListener(type, listener, options) {
        throw createNotImplementedError("Performance.addEventListener");
      }
      removeEventListener(type, listener, options) {
        throw createNotImplementedError("Performance.removeEventListener");
      }
      dispatchEvent(event) {
        throw createNotImplementedError("Performance.dispatchEvent");
      }
      toJSON() {
        return this;
      }
    };
    PerformanceObserver = class {
      static {
        __name(this, "PerformanceObserver");
      }
      __unenv__ = true;
      static supportedEntryTypes = [];
      _callback = null;
      constructor(callback) {
        this._callback = callback;
      }
      takeRecords() {
        return [];
      }
      disconnect() {
        throw createNotImplementedError("PerformanceObserver.disconnect");
      }
      observe(options) {
        throw createNotImplementedError("PerformanceObserver.observe");
      }
      bind(fn) {
        return fn;
      }
      runInAsyncScope(fn, thisArg, ...args) {
        return fn.call(thisArg, ...args);
      }
      asyncId() {
        return 0;
      }
      triggerAsyncId() {
        return 0;
      }
      emitDestroy() {
        return this;
      }
    };
    performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();
  }
});

// node_modules/unenv/dist/runtime/node/perf_hooks.mjs
var init_perf_hooks = __esm({
  "node_modules/unenv/dist/runtime/node/perf_hooks.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_performance();
  }
});

// node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
var init_performance2 = __esm({
  "node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs"() {
    init_perf_hooks();
    globalThis.performance = performance;
    globalThis.Performance = Performance;
    globalThis.PerformanceEntry = PerformanceEntry;
    globalThis.PerformanceMark = PerformanceMark;
    globalThis.PerformanceMeasure = PerformanceMeasure;
    globalThis.PerformanceObserver = PerformanceObserver;
    globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
    globalThis.PerformanceResourceTiming = PerformanceResourceTiming;
  }
});

// node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default;
var init_noop = __esm({
  "node_modules/unenv/dist/runtime/mock/noop.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    noop_default = Object.assign(() => {
    }, { __unenv__: true });
  }
});

// node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";
var _console, _ignoreErrors, _stderr, _stdout, log, info, trace, debug, table, error, warn, createTask, clear, count, countReset, dir, dirxml, group, groupEnd, groupCollapsed, profile, profileEnd, time, timeEnd, timeLog, timeStamp, Console, _times, _stdoutErrorHandler, _stderrErrorHandler;
var init_console = __esm({
  "node_modules/unenv/dist/runtime/node/console.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_noop();
    init_utils();
    _console = globalThis.console;
    _ignoreErrors = true;
    _stderr = new Writable();
    _stdout = new Writable();
    log = _console?.log ?? noop_default;
    info = _console?.info ?? log;
    trace = _console?.trace ?? info;
    debug = _console?.debug ?? log;
    table = _console?.table ?? log;
    error = _console?.error ?? log;
    warn = _console?.warn ?? error;
    createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
    clear = _console?.clear ?? noop_default;
    count = _console?.count ?? noop_default;
    countReset = _console?.countReset ?? noop_default;
    dir = _console?.dir ?? noop_default;
    dirxml = _console?.dirxml ?? noop_default;
    group = _console?.group ?? noop_default;
    groupEnd = _console?.groupEnd ?? noop_default;
    groupCollapsed = _console?.groupCollapsed ?? noop_default;
    profile = _console?.profile ?? noop_default;
    profileEnd = _console?.profileEnd ?? noop_default;
    time = _console?.time ?? noop_default;
    timeEnd = _console?.timeEnd ?? noop_default;
    timeLog = _console?.timeLog ?? noop_default;
    timeStamp = _console?.timeStamp ?? noop_default;
    Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
    _times = /* @__PURE__ */ new Map();
    _stdoutErrorHandler = noop_default;
    _stderrErrorHandler = noop_default;
  }
});

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole, assert, clear2, context, count2, countReset2, createTask2, debug2, dir2, dirxml2, error2, group2, groupCollapsed2, groupEnd2, info2, log2, profile2, profileEnd2, table2, time2, timeEnd2, timeLog2, timeStamp2, trace2, warn2, console_default;
var init_console2 = __esm({
  "node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_console();
    workerdConsole = globalThis["console"];
    ({
      assert,
      clear: clear2,
      context: (
        // @ts-expect-error undocumented public API
        context
      ),
      count: count2,
      countReset: countReset2,
      createTask: (
        // @ts-expect-error undocumented public API
        createTask2
      ),
      debug: debug2,
      dir: dir2,
      dirxml: dirxml2,
      error: error2,
      group: group2,
      groupCollapsed: groupCollapsed2,
      groupEnd: groupEnd2,
      info: info2,
      log: log2,
      profile: profile2,
      profileEnd: profileEnd2,
      table: table2,
      time: time2,
      timeEnd: timeEnd2,
      timeLog: timeLog2,
      timeStamp: timeStamp2,
      trace: trace2,
      warn: warn2
    } = workerdConsole);
    Object.assign(workerdConsole, {
      Console,
      _ignoreErrors,
      _stderr,
      _stderrErrorHandler,
      _stdout,
      _stdoutErrorHandler,
      _times
    });
    console_default = workerdConsole;
  }
});

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
var init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console = __esm({
  "node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console"() {
    init_console2();
    globalThis.console = console_default;
  }
});

// node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime;
var init_hrtime = __esm({
  "node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
      const now = Date.now();
      const seconds = Math.trunc(now / 1e3);
      const nanos = now % 1e3 * 1e6;
      if (startTime) {
        let diffSeconds = seconds - startTime[0];
        let diffNanos = nanos - startTime[0];
        if (diffNanos < 0) {
          diffSeconds = diffSeconds - 1;
          diffNanos = 1e9 + diffNanos;
        }
        return [diffSeconds, diffNanos];
      }
      return [seconds, nanos];
    }, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
      return BigInt(Date.now() * 1e6);
    }, "bigint") });
  }
});

// node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream;
var init_read_stream = __esm({
  "node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    ReadStream = class {
      static {
        __name(this, "ReadStream");
      }
      fd;
      isRaw = false;
      isTTY = false;
      constructor(fd) {
        this.fd = fd;
      }
      setRawMode(mode) {
        this.isRaw = mode;
        return this;
      }
    };
  }
});

// node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream;
var init_write_stream = __esm({
  "node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    WriteStream = class {
      static {
        __name(this, "WriteStream");
      }
      fd;
      columns = 80;
      rows = 24;
      isTTY = false;
      constructor(fd) {
        this.fd = fd;
      }
      clearLine(dir3, callback) {
        callback && callback();
        return false;
      }
      clearScreenDown(callback) {
        callback && callback();
        return false;
      }
      cursorTo(x, y, callback) {
        callback && typeof callback === "function" && callback();
        return false;
      }
      moveCursor(dx, dy, callback) {
        callback && callback();
        return false;
      }
      getColorDepth(env2) {
        return 1;
      }
      hasColors(count3, env2) {
        return false;
      }
      getWindowSize() {
        return [this.columns, this.rows];
      }
      write(str, encoding, cb) {
        if (str instanceof Uint8Array) {
          str = new TextDecoder().decode(str);
        }
        try {
          console.log(str);
        } catch {
        }
        cb && typeof cb === "function" && cb();
        return false;
      }
    };
  }
});

// node_modules/unenv/dist/runtime/node/tty.mjs
var init_tty = __esm({
  "node_modules/unenv/dist/runtime/node/tty.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_read_stream();
    init_write_stream();
  }
});

// node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION;
var init_node_version = __esm({
  "node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    NODE_VERSION = "22.14.0";
  }
});

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";
var Process;
var init_process = __esm({
  "node_modules/unenv/dist/runtime/node/internal/process/process.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_tty();
    init_utils();
    init_node_version();
    Process = class _Process extends EventEmitter {
      static {
        __name(this, "Process");
      }
      env;
      hrtime;
      nextTick;
      constructor(impl) {
        super();
        this.env = impl.env;
        this.hrtime = impl.hrtime;
        this.nextTick = impl.nextTick;
        for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
          const value = this[prop];
          if (typeof value === "function") {
            this[prop] = value.bind(this);
          }
        }
      }
      // --- event emitter ---
      emitWarning(warning, type, code) {
        console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
      }
      emit(...args) {
        return super.emit(...args);
      }
      listeners(eventName) {
        return super.listeners(eventName);
      }
      // --- stdio (lazy initializers) ---
      #stdin;
      #stdout;
      #stderr;
      get stdin() {
        return this.#stdin ??= new ReadStream(0);
      }
      get stdout() {
        return this.#stdout ??= new WriteStream(1);
      }
      get stderr() {
        return this.#stderr ??= new WriteStream(2);
      }
      // --- cwd ---
      #cwd = "/";
      chdir(cwd2) {
        this.#cwd = cwd2;
      }
      cwd() {
        return this.#cwd;
      }
      // --- dummy props and getters ---
      arch = "";
      platform = "";
      argv = [];
      argv0 = "";
      execArgv = [];
      execPath = "";
      title = "";
      pid = 200;
      ppid = 100;
      get version() {
        return `v${NODE_VERSION}`;
      }
      get versions() {
        return { node: NODE_VERSION };
      }
      get allowedNodeEnvironmentFlags() {
        return /* @__PURE__ */ new Set();
      }
      get sourceMapsEnabled() {
        return false;
      }
      get debugPort() {
        return 0;
      }
      get throwDeprecation() {
        return false;
      }
      get traceDeprecation() {
        return false;
      }
      get features() {
        return {};
      }
      get release() {
        return {};
      }
      get connected() {
        return false;
      }
      get config() {
        return {};
      }
      get moduleLoadList() {
        return [];
      }
      constrainedMemory() {
        return 0;
      }
      availableMemory() {
        return 0;
      }
      uptime() {
        return 0;
      }
      resourceUsage() {
        return {};
      }
      // --- noop methods ---
      ref() {
      }
      unref() {
      }
      // --- unimplemented methods ---
      umask() {
        throw createNotImplementedError("process.umask");
      }
      getBuiltinModule() {
        return void 0;
      }
      getActiveResourcesInfo() {
        throw createNotImplementedError("process.getActiveResourcesInfo");
      }
      exit() {
        throw createNotImplementedError("process.exit");
      }
      reallyExit() {
        throw createNotImplementedError("process.reallyExit");
      }
      kill() {
        throw createNotImplementedError("process.kill");
      }
      abort() {
        throw createNotImplementedError("process.abort");
      }
      dlopen() {
        throw createNotImplementedError("process.dlopen");
      }
      setSourceMapsEnabled() {
        throw createNotImplementedError("process.setSourceMapsEnabled");
      }
      loadEnvFile() {
        throw createNotImplementedError("process.loadEnvFile");
      }
      disconnect() {
        throw createNotImplementedError("process.disconnect");
      }
      cpuUsage() {
        throw createNotImplementedError("process.cpuUsage");
      }
      setUncaughtExceptionCaptureCallback() {
        throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
      }
      hasUncaughtExceptionCaptureCallback() {
        throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
      }
      initgroups() {
        throw createNotImplementedError("process.initgroups");
      }
      openStdin() {
        throw createNotImplementedError("process.openStdin");
      }
      assert() {
        throw createNotImplementedError("process.assert");
      }
      binding() {
        throw createNotImplementedError("process.binding");
      }
      // --- attached interfaces ---
      permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
      report = {
        directory: "",
        filename: "",
        signal: "SIGUSR2",
        compact: false,
        reportOnFatalError: false,
        reportOnSignal: false,
        reportOnUncaughtException: false,
        getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
        writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
      };
      finalization = {
        register: /* @__PURE__ */ notImplemented("process.finalization.register"),
        unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
        registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
      };
      memoryUsage = Object.assign(() => ({
        arrayBuffers: 0,
        rss: 0,
        external: 0,
        heapTotal: 0,
        heapUsed: 0
      }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
      // --- undefined props ---
      mainModule = void 0;
      domain = void 0;
      // optional
      send = void 0;
      exitCode = void 0;
      channel = void 0;
      getegid = void 0;
      geteuid = void 0;
      getgid = void 0;
      getgroups = void 0;
      getuid = void 0;
      setegid = void 0;
      seteuid = void 0;
      setgid = void 0;
      setgroups = void 0;
      setuid = void 0;
      // internals
      _events = void 0;
      _eventsCount = void 0;
      _exiting = void 0;
      _maxListeners = void 0;
      _debugEnd = void 0;
      _debugProcess = void 0;
      _fatalException = void 0;
      _getActiveHandles = void 0;
      _getActiveRequests = void 0;
      _kill = void 0;
      _preload_modules = void 0;
      _rawDebug = void 0;
      _startProfilerIdleNotifier = void 0;
      _stopProfilerIdleNotifier = void 0;
      _tickCallback = void 0;
      _disconnect = void 0;
      _handleQueue = void 0;
      _pendingMessage = void 0;
      _channel = void 0;
      _send = void 0;
      _linkedBinding = void 0;
    };
  }
});

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess, getBuiltinModule, workerdProcess, unenvProcess, exit, features, platform, _channel, _debugEnd, _debugProcess, _disconnect, _events, _eventsCount, _exiting, _fatalException, _getActiveHandles, _getActiveRequests, _handleQueue, _kill, _linkedBinding, _maxListeners, _pendingMessage, _preload_modules, _rawDebug, _send, _startProfilerIdleNotifier, _stopProfilerIdleNotifier, _tickCallback, abort, addListener, allowedNodeEnvironmentFlags, arch, argv, argv0, assert2, availableMemory, binding, channel, chdir, config, connected, constrainedMemory, cpuUsage, cwd, debugPort, disconnect, dlopen, domain, emit, emitWarning, env, eventNames, execArgv, execPath, exitCode, finalization, getActiveResourcesInfo, getegid, geteuid, getgid, getgroups, getMaxListeners, getuid, hasUncaughtExceptionCaptureCallback, hrtime3, initgroups, kill, listenerCount, listeners, loadEnvFile, mainModule, memoryUsage, moduleLoadList, nextTick, off, on, once, openStdin, permission, pid, ppid, prependListener, prependOnceListener, rawListeners, reallyExit, ref, release, removeAllListeners, removeListener, report, resourceUsage, send, setegid, seteuid, setgid, setgroups, setMaxListeners, setSourceMapsEnabled, setuid, setUncaughtExceptionCaptureCallback, sourceMapsEnabled, stderr, stdin, stdout, throwDeprecation, title, traceDeprecation, umask, unref, uptime, version, versions, _process, process_default;
var init_process2 = __esm({
  "node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_hrtime();
    init_process();
    globalProcess = globalThis["process"];
    getBuiltinModule = globalProcess.getBuiltinModule;
    workerdProcess = getBuiltinModule("node:process");
    unenvProcess = new Process({
      env: globalProcess.env,
      hrtime,
      // `nextTick` is available from workerd process v1
      nextTick: workerdProcess.nextTick
    });
    ({ exit, features, platform } = workerdProcess);
    ({
      _channel,
      _debugEnd,
      _debugProcess,
      _disconnect,
      _events,
      _eventsCount,
      _exiting,
      _fatalException,
      _getActiveHandles,
      _getActiveRequests,
      _handleQueue,
      _kill,
      _linkedBinding,
      _maxListeners,
      _pendingMessage,
      _preload_modules,
      _rawDebug,
      _send,
      _startProfilerIdleNotifier,
      _stopProfilerIdleNotifier,
      _tickCallback,
      abort,
      addListener,
      allowedNodeEnvironmentFlags,
      arch,
      argv,
      argv0,
      assert: assert2,
      availableMemory,
      binding,
      channel,
      chdir,
      config,
      connected,
      constrainedMemory,
      cpuUsage,
      cwd,
      debugPort,
      disconnect,
      dlopen,
      domain,
      emit,
      emitWarning,
      env,
      eventNames,
      execArgv,
      execPath,
      exitCode,
      finalization,
      getActiveResourcesInfo,
      getegid,
      geteuid,
      getgid,
      getgroups,
      getMaxListeners,
      getuid,
      hasUncaughtExceptionCaptureCallback,
      hrtime: hrtime3,
      initgroups,
      kill,
      listenerCount,
      listeners,
      loadEnvFile,
      mainModule,
      memoryUsage,
      moduleLoadList,
      nextTick,
      off,
      on,
      once,
      openStdin,
      permission,
      pid,
      ppid,
      prependListener,
      prependOnceListener,
      rawListeners,
      reallyExit,
      ref,
      release,
      removeAllListeners,
      removeListener,
      report,
      resourceUsage,
      send,
      setegid,
      seteuid,
      setgid,
      setgroups,
      setMaxListeners,
      setSourceMapsEnabled,
      setuid,
      setUncaughtExceptionCaptureCallback,
      sourceMapsEnabled,
      stderr,
      stdin,
      stdout,
      throwDeprecation,
      title,
      traceDeprecation,
      umask,
      unref,
      uptime,
      version,
      versions
    } = unenvProcess);
    _process = {
      abort,
      addListener,
      allowedNodeEnvironmentFlags,
      hasUncaughtExceptionCaptureCallback,
      setUncaughtExceptionCaptureCallback,
      loadEnvFile,
      sourceMapsEnabled,
      arch,
      argv,
      argv0,
      chdir,
      config,
      connected,
      constrainedMemory,
      availableMemory,
      cpuUsage,
      cwd,
      debugPort,
      dlopen,
      disconnect,
      emit,
      emitWarning,
      env,
      eventNames,
      execArgv,
      execPath,
      exit,
      finalization,
      features,
      getBuiltinModule,
      getActiveResourcesInfo,
      getMaxListeners,
      hrtime: hrtime3,
      kill,
      listeners,
      listenerCount,
      memoryUsage,
      nextTick,
      on,
      off,
      once,
      pid,
      platform,
      ppid,
      prependListener,
      prependOnceListener,
      rawListeners,
      release,
      removeAllListeners,
      removeListener,
      report,
      resourceUsage,
      setMaxListeners,
      setSourceMapsEnabled,
      stderr,
      stdin,
      stdout,
      title,
      throwDeprecation,
      traceDeprecation,
      umask,
      uptime,
      version,
      versions,
      // @ts-expect-error old API
      domain,
      initgroups,
      moduleLoadList,
      reallyExit,
      openStdin,
      assert: assert2,
      binding,
      send,
      exitCode,
      channel,
      getegid,
      geteuid,
      getgid,
      getgroups,
      getuid,
      setegid,
      seteuid,
      setgid,
      setgroups,
      setuid,
      permission,
      mainModule,
      _events,
      _eventsCount,
      _exiting,
      _maxListeners,
      _debugEnd,
      _debugProcess,
      _fatalException,
      _getActiveHandles,
      _getActiveRequests,
      _kill,
      _preload_modules,
      _rawDebug,
      _startProfilerIdleNotifier,
      _stopProfilerIdleNotifier,
      _tickCallback,
      _disconnect,
      _handleQueue,
      _pendingMessage,
      _channel,
      _send,
      _linkedBinding
    };
    process_default = _process;
  }
});

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
var init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process = __esm({
  "node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process"() {
    init_process2();
    globalThis.process = process_default;
  }
});

// wrangler-modules-watch:wrangler:modules-watch
var init_wrangler_modules_watch = __esm({
  "wrangler-modules-watch:wrangler:modules-watch"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
  }
});

// node_modules/wrangler/templates/modules-watch-stub.js
var init_modules_watch_stub = __esm({
  "node_modules/wrangler/templates/modules-watch-stub.js"() {
    init_wrangler_modules_watch();
  }
});

// node_modules/worker-mailer/dist/index.mjs
var dist_exports = {};
__export(dist_exports, {
  Email: () => f,
  LogLevel: () => S,
  WorkerMailer: () => b,
  encodeHeader: () => c
});
import { connect as U } from "cloudflare:sockets";
async function T(a3, e, t) {
  return Promise.race([a3, new Promise((r, n) => setTimeout(() => n(t), e))]);
}
function d(a3) {
  return E.encode(a3);
}
function v(a3) {
  return A.decode(a3);
}
function w(a3, e = 76) {
  let t = d(a3), r = "", n = 0, i = 0;
  for (; i < t.length; ) {
    let o = t[i], s;
    if (o === 10) {
      r += `\r
`, n = 0, i++;
      continue;
    } else if (o === 13) if (i + 1 < t.length && t[i + 1] === 10) {
      r += `\r
`, n = 0, i += 2;
      continue;
    } else s = "=0D";
    if (s === void 0) {
      let l = o === 32 || o === 9, h = i + 1 >= t.length || t[i + 1] === 10 || t[i + 1] === 13;
      o < 32 && !l || o > 126 || o === 61 || l && h ? s = `=${o.toString(16).toUpperCase().padStart(2, "0")}` : s = String.fromCharCode(o);
    }
    n + s.length > e - 3 && (r += `=\r
`, n = 0), r += s, n += s.length, i++;
  }
  return r;
}
function c(a3) {
  if (!/[^\x00-\x7F]/.test(a3)) return a3;
  let e = d(a3), t = "";
  for (let r of e) r >= 33 && r <= 126 && r !== 63 && r !== 61 && r !== 95 ? t += String.fromCharCode(r) : r === 32 ? t += "_" : t += `=${r.toString(16).toUpperCase().padStart(2, "0")}`;
  return `=?UTF-8?Q?${t}?=`;
}
var u, E, A, f, S, p, b;
var init_dist = __esm({
  "node_modules/worker-mailer/dist/index.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    u = class {
      static {
        __name(this, "u");
      }
      values = [];
      resolvers = [];
      enqueue(e) {
        this.resolvers.length || this.addWrapper(), this.resolvers.shift()(e);
      }
      async dequeue() {
        return this.values.length || this.addWrapper(), this.values.shift();
      }
      get length() {
        return this.values.length;
      }
      clear() {
        this.values = [], this.resolvers = [];
      }
      addWrapper() {
        this.values.push(new Promise((e) => {
          this.resolvers.push(e);
        }));
      }
    };
    __name(T, "T");
    E = new TextEncoder();
    __name(d, "d");
    A = new TextDecoder("utf-8");
    __name(v, "v");
    __name(w, "w");
    __name(c, "c");
    f = class a {
      static {
        __name(this, "a");
      }
      from;
      to;
      reply;
      cc;
      bcc;
      subject;
      text;
      html;
      dsnOverride;
      attachments;
      headers;
      setSent;
      setSentError;
      sent = new Promise((e, t) => {
        this.setSent = e, this.setSentError = t;
      });
      constructor(e) {
        if (!e.text && !e.html) throw new Error("At least one of text or html must be provided");
        typeof e.from == "string" ? this.from = { email: e.from } : this.from = e.from, typeof e.reply == "string" ? this.reply = { email: e.reply } : this.reply = e.reply, this.to = a.toUsers(e.to), this.cc = a.toUsers(e.cc), this.bcc = a.toUsers(e.bcc), this.subject = e.subject, this.text = e.text, this.html = e.html, this.attachments = e.attachments, this.dsnOverride = e.dsnOverride, this.headers = e.headers || {};
      }
      static toUsers(e) {
        if (e) return typeof e == "string" ? [{ email: e }] : Array.isArray(e) ? e.map((t) => typeof t == "string" ? { email: t } : t) : [e];
      }
      getEmailData() {
        this.resolveHeader();
        let e = ["MIME-Version: 1.0"];
        for (let [s, l] of Object.entries(this.headers)) e.push(`${s}: ${l}`);
        let t = this.generateSafeBoundary("mixed_"), r = this.generateSafeBoundary("alternative_");
        e.push(`Content-Type: multipart/mixed; boundary="${t}"`);
        let i = `${e.join(`\r
`)}\r
\r
`;
        if (i += `--${t}\r
`, i += `Content-Type: multipart/alternative; boundary="${r}"\r
\r
`, this.text) {
          i += `--${r}\r
`, i += `Content-Type: text/plain; charset="UTF-8"\r
`, i += `Content-Transfer-Encoding: quoted-printable\r
\r
`;
          let s = w(this.text);
          i += `${s}\r
\r
`;
        }
        if (this.html) {
          i += `--${r}\r
`, i += `Content-Type: text/html; charset="UTF-8"\r
`, i += `Content-Transfer-Encoding: quoted-printable\r
\r
`;
          let s = w(this.html);
          i += `${s}\r
\r
`;
        }
        if (i += `--${r}--\r
`, this.attachments) for (let s of this.attachments) {
          let l = s.mimeType || this.getMimeType(s.filename);
          i += `--${t}\r
`, i += `Content-Type: ${l}; name="${s.filename}"\r
`, i += `Content-Description: ${s.filename}\r
`, i += `Content-Disposition: attachment; filename="${s.filename}";\r
`, i += `    creation-date="${(/* @__PURE__ */ new Date()).toUTCString()}";\r
`, i += `Content-Transfer-Encoding: base64\r
\r
`;
          let h = s.content.match(/.{1,72}/g);
          h ? i += `${h.join(`\r
`)}` : i += `${s.content}`, i += `\r
\r
`;
        }
        return i += `--${t}--\r
`, `${this.applyDotStuffing(i)}\r
.\r
`;
      }
      applyDotStuffing(e) {
        let t = e.replace(/\r\n\./g, `\r
..`);
        return t.startsWith(".") && (t = `.${t}`), t;
      }
      generateSafeBoundary(e) {
        let t = new Uint8Array(28);
        crypto.getRandomValues(t);
        let r = Array.from(t).map((i) => i.toString(16).padStart(2, "0")).join(""), n = e + r;
        return n = n.replace(/[<>@,;:\\/[\]?=" ]/g, "_"), n;
      }
      getMimeType(e) {
        let t = e.split(".").pop()?.toLowerCase();
        return { txt: "text/plain", html: "text/html", csv: "text/csv", pdf: "application/pdf", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", zip: "application/zip" }[t || "txt"] || "application/octet-stream";
      }
      resolveHeader() {
        this.resolveFrom(), this.resolveTo(), this.resolveReply(), this.resolveCC(), this.resolveBCC(), this.resolveSubject(), this.headers.Date = this.headers.Date ?? (/* @__PURE__ */ new Date()).toUTCString(), this.headers["Message-ID"] = this.headers["Message-ID"] ?? `<${crypto.randomUUID()}@${this.from.email.split("@").pop()}>`;
      }
      resolveFrom() {
        if (this.headers.From) return;
        let e = this.from.email;
        this.from.name && (e = `"${c(this.from.name)}" <${e}>`), this.headers.From = e;
      }
      resolveTo() {
        if (this.headers.To) return;
        let e = this.to.map((t) => t.name ? `"${c(t.name)}" <${t.email}>` : t.email);
        this.headers.To = e.join(", ");
      }
      resolveSubject() {
        this.headers.Subject || this.subject && (this.headers.Subject = c(this.subject));
      }
      resolveReply() {
        if (!this.headers["Reply-To"] && this.reply) {
          let e = this.reply.email;
          this.reply.name && (e = `"${c(this.reply.name)}" <${e}>`), this.headers["Reply-To"] = e;
        }
      }
      resolveCC() {
        if (!this.headers.CC && this.cc) {
          let e = this.cc.map((t) => t.name ? `"${c(t.name)}" <${t.email}>` : t.email);
          this.headers.CC = e.join(", ");
        }
      }
      resolveBCC() {
        if (!this.headers.BCC && this.bcc) {
          let e = this.bcc.map((t) => t.name ? `"${c(t.name)}" <${t.email}>` : t.email);
          this.headers.BCC = e.join(", ");
        }
      }
    };
    S = ((i) => (i[i.DEBUG = 0] = "DEBUG", i[i.INFO = 1] = "INFO", i[i.WARN = 2] = "WARN", i[i.ERROR = 3] = "ERROR", i[i.NONE = 4] = "NONE", i))(S || {});
    p = class {
      static {
        __name(this, "p");
      }
      constructor(e = 1, t) {
        this.level = e;
        this.prefix = t;
      }
      prefix;
      debug(e, ...t) {
        this.level <= 0 && console.debug(this.prefix + e, ...t);
      }
      info(e, ...t) {
        this.level <= 1 && console.info(this.prefix + e, ...t);
      }
      warn(e, ...t) {
        this.level <= 2 && console.warn(this.prefix + e, ...t);
      }
      error(e, ...t) {
        this.level <= 3 && console.error(this.prefix + e, ...t);
      }
    };
    b = class a2 {
      static {
        __name(this, "a");
      }
      socket;
      host;
      port;
      secure;
      startTls;
      authType;
      credentials;
      socketTimeoutMs;
      responseTimeoutMs;
      reader;
      writer;
      logger;
      dsn;
      sendNotificationsTo;
      active = false;
      emailSending = null;
      emailToBeSent = new u();
      supportsDSN = false;
      allowAuth = false;
      authTypeSupported = [];
      supportsStartTls = false;
      constructor(e) {
        this.port = e.port, this.host = e.host, this.secure = !!e.secure, Array.isArray(e.authType) ? this.authType = e.authType : typeof e.authType == "string" ? this.authType = [e.authType] : this.authType = [], this.startTls = e.startTls === void 0 ? true : e.startTls, this.credentials = e.credentials, this.dsn = e.dsn || {}, this.socketTimeoutMs = e.socketTimeoutMs || 6e4, this.responseTimeoutMs = e.socketTimeoutMs || 3e4, this.socket = U({ hostname: this.host, port: this.port }, { secureTransport: this.secure ? "on" : this.startTls ? "starttls" : "off", allowHalfOpen: false }), this.reader = this.socket.readable.getReader(), this.writer = this.socket.writable.getWriter(), this.logger = new p(e.logLevel, `[WorkerMailer:${this.host}:${this.port}]`);
      }
      static async connect(e) {
        let t = new a2(e);
        return await t.initializeSmtpSession(), t.start().catch(console.error), t;
      }
      send(e) {
        let t = new f(e);
        return this.emailToBeSent.enqueue(t), t.sent;
      }
      static async send(e, t) {
        let r = await a2.connect(e);
        await r.send(t), await r.close();
      }
      async readTimeout() {
        return T(this.read(), this.responseTimeoutMs, new Error("Timeout while waiting for smtp server response"));
      }
      async read() {
        let e = "";
        for (; ; ) {
          let { value: t } = await this.reader.read();
          if (!t) continue;
          let r = v(t).toString();
          if (this.logger.debug(`SMTP server response:
` + r), e = e + r, !e.endsWith(`
`)) continue;
          let n = e.split(/\r?\n/), i = n[n.length - 2];
          if (!/^\d+-/.test(i)) return e;
        }
      }
      async writeLine(e) {
        await this.write(`${e}\r
`);
      }
      async write(e) {
        this.logger.debug(`Write to socket:
` + e), await this.writer.write(d(e));
      }
      async initializeSmtpSession() {
        await this.waitForSocketConnected(), await this.greet(), await this.ehlo(), this.startTls && !this.secure && this.supportsStartTls && (await this.tls(), await this.ehlo()), await this.auth(), this.active = true;
      }
      async start() {
        for (; this.active; ) {
          this.emailSending = await this.emailToBeSent.dequeue();
          try {
            await this.mail(), await this.rcpt(), await this.data(), await this.body(), this.emailSending.setSent();
          } catch (e) {
            if (this.logger.error("Failed to send email: " + e.message), !this.active) return;
            this.emailSending.setSentError(e);
            try {
              await this.rset();
            } catch (t) {
              await this.close(t);
            }
          }
          this.emailSending = null;
        }
      }
      async close(e) {
        for (this.active = false, this.logger.info("WorkerMailer is closed", e?.message || ""), this.emailSending?.setSentError?.(e || new Error("WorkerMailer is shutting down")); this.emailToBeSent.length; ) (await this.emailToBeSent.dequeue()).setSentError(e || new Error("WorkerMailer is shutting down"));
        try {
          await this.writeLine("QUIT"), await this.readTimeout(), this.socket.close().catch(() => this.logger.error("Failed to close socket"));
        } catch {
        }
      }
      async waitForSocketConnected() {
        this.logger.info("Connecting to SMTP server"), await T(this.socket.opened, this.socketTimeoutMs, new Error("Socket timeout!")), this.logger.info("SMTP server connected");
      }
      async greet() {
        let e = await this.readTimeout();
        if (!e.startsWith("220")) throw new Error("Failed to connect to SMTP server: " + e);
      }
      async ehlo() {
        await this.writeLine("EHLO 127.0.0.1");
        let e = await this.readTimeout();
        if (e.startsWith("421")) throw new Error(`Failed to EHLO. ${e}`);
        if (!e.startsWith("2")) {
          await this.helo();
          return;
        }
        this.parseCapabilities(e);
      }
      async helo() {
        await this.writeLine("HELO 127.0.0.1");
        let e = await this.readTimeout();
        if (!e.startsWith("2")) throw new Error(`Failed to HELO. ${e}`);
      }
      async tls() {
        await this.writeLine("STARTTLS");
        let e = await this.readTimeout();
        if (!e.startsWith("220")) throw new Error("Failed to start TLS: " + e);
        this.reader.releaseLock(), this.writer.releaseLock(), this.socket = this.socket.startTls(), this.reader = this.socket.readable.getReader(), this.writer = this.socket.writable.getWriter();
      }
      parseCapabilities(e) {
        /[ -]AUTH\b/i.test(e) && (this.allowAuth = true), /[ -]AUTH(?:(\s+|=)[^\n]*\s+|\s+|=)PLAIN/i.test(e) && this.authTypeSupported.push("plain"), /[ -]AUTH(?:(\s+|=)[^\n]*\s+|\s+|=)LOGIN/i.test(e) && this.authTypeSupported.push("login"), /[ -]AUTH(?:(\s+|=)[^\n]*\s+|\s+|=)CRAM-MD5/i.test(e) && this.authTypeSupported.push("cram-md5"), /[ -]STARTTLS\b/i.test(e) && (this.supportsStartTls = true), /[ -]DSN\b/i.test(e) && (this.supportsDSN = true);
      }
      async auth() {
        if (this.allowAuth) {
          if (!this.credentials) throw new Error("smtp server requires authentication, but no credentials found");
          if (this.authTypeSupported.includes("plain") && this.authType.includes("plain")) await this.authWithPlain();
          else if (this.authTypeSupported.includes("login") && this.authType.includes("login")) await this.authWithLogin();
          else if (this.authTypeSupported.includes("cram-md5") && this.authType.includes("cram-md5")) await this.authWithCramMD5();
          else throw new Error("No supported auth method found.");
        }
      }
      async authWithPlain() {
        let e = btoa(`\0${this.credentials.username}\0${this.credentials.password}`);
        await this.writeLine(`AUTH PLAIN ${e}`);
        let t = await this.readTimeout();
        if (!t.startsWith("2")) throw new Error(`Failed to plain authentication: ${t}`);
      }
      async authWithLogin() {
        await this.writeLine("AUTH LOGIN");
        let e = await this.readTimeout();
        if (!e.startsWith("3")) throw new Error("Invalid login: " + e);
        let t = btoa(this.credentials.username);
        await this.writeLine(t);
        let r = await this.readTimeout();
        if (!r.startsWith("3")) throw new Error("Failed to login authentication: " + r);
        let n = btoa(this.credentials.password);
        await this.writeLine(n);
        let i = await this.readTimeout();
        if (!i.startsWith("2")) throw new Error("Failed to login authentication: " + i);
      }
      async authWithCramMD5() {
        await this.writeLine("AUTH CRAM-MD5");
        let e = await this.readTimeout(), t = e.match(/^334\s+(.+)$/)?.pop();
        if (!t) throw new Error("Invalid CRAM-MD5 challenge: " + e);
        let r = atob(t), n = d(this.credentials.password), i = await crypto.subtle.importKey("raw", n, { name: "HMAC", hash: "MD5" }, false, ["sign"]), o = d(r), s = await crypto.subtle.sign("HMAC", i, o), l = Array.from(new Uint8Array(s)).map((y) => y.toString(16).padStart(2, "0")).join("");
        await this.writeLine(btoa(`${this.credentials.username} ${l}`));
        let h = await this.readTimeout();
        if (!h.startsWith("2")) throw new Error("Failed to cram-md5 authentication: " + h);
      }
      async mail() {
        let e = `MAIL FROM: <${this.emailSending.from.email}>`;
        this.supportsDSN && (e += ` ${this.retBuilder()}`, this.emailSending?.dsnOverride?.envelopeId && (e += ` ENVID=${this.emailSending?.dsnOverride?.envelopeId}`)), await this.writeLine(e);
        let t = await this.readTimeout();
        if (!t.startsWith("2")) throw new Error(`Invalid ${e} ${t}`);
      }
      async rcpt() {
        let e = [...this.emailSending.to, ...this.emailSending.cc || [], ...this.emailSending.bcc || []];
        for (let t of e) {
          let r = `RCPT TO: <${t.email}>`;
          this.supportsDSN && (r += this.notificationBuilder()), await this.writeLine(r);
          let n = await this.readTimeout();
          if (!n.startsWith("2")) throw new Error(`Invalid ${r} ${n}`);
        }
      }
      async data() {
        await this.writeLine("DATA");
        let e = await this.readTimeout();
        if (!e.startsWith("3")) throw new Error(`Failed to send DATA: ${e}`);
      }
      async body() {
        await this.write(this.emailSending.getEmailData());
        let e = await this.readTimeout();
        if (!e.startsWith("2")) throw new Error("Failed send email body: " + e);
      }
      async rset() {
        await this.writeLine("RSET");
        let e = await this.readTimeout();
        if (!e.startsWith("2")) throw new Error(`Failed to reset: ${e}`);
      }
      notificationBuilder() {
        let e = [];
        return (this.emailSending?.dsnOverride?.NOTIFY && this.emailSending?.dsnOverride?.NOTIFY?.SUCCESS || !this.emailSending?.dsnOverride?.NOTIFY && this.dsn?.NOTIFY?.SUCCESS) && e.push("SUCCESS"), (this.emailSending?.dsnOverride?.NOTIFY && this.emailSending?.dsnOverride?.NOTIFY?.FAILURE || !this.emailSending?.dsnOverride?.NOTIFY && this.dsn?.NOTIFY?.FAILURE) && e.push("FAILURE"), (this.emailSending?.dsnOverride?.NOTIFY && this.emailSending?.dsnOverride?.NOTIFY?.DELAY || !this.emailSending?.dsnOverride?.NOTIFY && this.dsn?.NOTIFY?.DELAY) && e.push("DELAY"), e.length > 0 ? ` NOTIFY=${e.join(",")}` : " NOTIFY=NEVER";
      }
      retBuilder() {
        let e = [];
        return (this.emailSending?.dsnOverride?.RET && this.emailSending?.dsnOverride?.RET?.HEADERS || !this.emailSending?.dsnOverride?.RET && this.dsn?.RET?.HEADERS) && e.push("HDRS"), (this.emailSending?.dsnOverride?.RET && this.emailSending?.dsnOverride?.RET?.FULL || !this.emailSending?.dsnOverride?.RET && this.dsn?.RET?.FULL) && e.push("FULL"), e.length > 0 ? `RET=${e.join(",")}` : "";
      }
    };
  }
});

// .wrangler/tmp/bundle-nKFSHS/middleware-loader.entry.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// .wrangler/tmp/bundle-nKFSHS/middleware-insertion-facade.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// src/index.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/index.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/hono.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/hono-base.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/compose.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var compose = /* @__PURE__ */ __name((middleware, onError, onNotFound) => {
  return (context2, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context2.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context2, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context2.error = err;
            res = await onError(err, context2);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context2.finalized === false && onNotFound) {
          res = await onNotFound(context2);
        }
      }
      if (res && (context2.finalized === false || isError)) {
        context2.res = res;
      }
      return context2;
    }
    __name(dispatch, "dispatch");
  };
}, "compose");

// node_modules/hono/dist/context.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/request.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/http-exception.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/request/constants.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var GET_MATCH_RESULT = /* @__PURE__ */ Symbol();

// node_modules/hono/dist/utils/body.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var parseBody = /* @__PURE__ */ __name(async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all, dot });
  }
  return {};
}, "parseBody");
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
__name(parseFormData, "parseFormData");
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
__name(convertFormDataToBodyData, "convertFormDataToBodyData");
var handleParsingAllValues = /* @__PURE__ */ __name((form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
}, "handleParsingAllValues");
var handleParsingNestedValues = /* @__PURE__ */ __name((form, key, value) => {
  let nestedForm = form;
  const keys = key.split(".");
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
}, "handleParsingNestedValues");

// node_modules/hono/dist/utils/url.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var splitPath = /* @__PURE__ */ __name((path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
}, "splitPath");
var splitRoutingPath = /* @__PURE__ */ __name((routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
}, "splitRoutingPath");
var extractGroupsFromPath = /* @__PURE__ */ __name((path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match2, index) => {
    const mark = `@${index}`;
    groups.push([mark, match2]);
    return mark;
  });
  return { groups, path };
}, "extractGroupsFromPath");
var replaceGroupMarks = /* @__PURE__ */ __name((paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
}, "replaceGroupMarks");
var patternCache = {};
var getPattern = /* @__PURE__ */ __name((label, next) => {
  if (label === "*") {
    return "*";
  }
  const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match2) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match2[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match2[1], new RegExp(`^${match2[2]}(?=/${next})`)] : [label, match2[1], new RegExp(`^${match2[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match2[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
}, "getPattern");
var tryDecode = /* @__PURE__ */ __name((str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
      try {
        return decoder(match2);
      } catch {
        return match2;
      }
    });
  }
}, "tryDecode");
var tryDecodeURI = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURI), "tryDecodeURI");
var getPath = /* @__PURE__ */ __name((request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const hashIndex = url.indexOf("#", i);
      const end = queryIndex === -1 ? hashIndex === -1 ? void 0 : hashIndex : hashIndex === -1 ? queryIndex : Math.min(queryIndex, hashIndex);
      const path = url.slice(start, end);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63 || charCode === 35) {
      break;
    }
  }
  return url.slice(start, i);
}, "getPath");
var getPathNoStrict = /* @__PURE__ */ __name((request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
}, "getPathNoStrict");
var mergePath = /* @__PURE__ */ __name((base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
}, "mergePath");
var checkOptionalParameter = /* @__PURE__ */ __name((path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v2, i, a3) => a3.indexOf(v2) === i);
}, "checkOptionalParameter");
var _decodeURI = /* @__PURE__ */ __name((value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
}, "_decodeURI");
var _getQueryParam = /* @__PURE__ */ __name((url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf("?", 8);
    if (keyIndex2 === -1) {
      return void 0;
    }
    if (!url.startsWith(key, keyIndex2 + 1)) {
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
}, "_getQueryParam");
var getQueryParam = _getQueryParam;
var getQueryParams = /* @__PURE__ */ __name((url, key) => {
  return _getQueryParam(url, key, true);
}, "getQueryParams");
var decodeURIComponent_ = decodeURIComponent;

// node_modules/hono/dist/request.js
var tryDecodeURIComponent = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURIComponent_), "tryDecodeURIComponent");
var HonoRequest = class {
  static {
    __name(this, "HonoRequest");
  }
  /**
   * `.raw` can get the raw Request object.
   *
   * @see {@link https://hono.dev/docs/api/request#raw}
   *
   * @example
   * ```ts
   * // For Cloudflare Workers
   * app.post('/', async (c) => {
   *   const metadata = c.req.raw.cf?.hostMetadata?
   *   ...
   * })
   * ```
   */
  raw;
  #validatedData;
  // Short name of validatedData
  #matchResult;
  routeIndex = 0;
  /**
   * `.path` can get the pathname of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#path}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const pathname = c.req.path // `/about/me`
   * })
   * ```
   */
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param && /\%/.test(param) ? tryDecodeURIComponent(param) : param;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return this.bodyCache.parsedBody ??= await parseBody(this, options);
  }
  #cachedBody = /* @__PURE__ */ __name((key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  }, "#cachedBody");
  /**
   * `.json()` can parse Request body of type `application/json`
   *
   * @see {@link https://hono.dev/docs/api/request#json}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.json()
   * })
   * ```
   */
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  /**
   * `.text()` can parse Request body of type `text/plain`
   *
   * @see {@link https://hono.dev/docs/api/request#text}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.text()
   * })
   * ```
   */
  text() {
    return this.#cachedBody("text");
  }
  /**
   * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
   *
   * @see {@link https://hono.dev/docs/api/request#arraybuffer}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.arrayBuffer()
   * })
   * ```
   */
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  /**
   * Parses the request body as a `Blob`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.blob();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#blob
   */
  blob() {
    return this.#cachedBody("blob");
  }
  /**
   * Parses the request body as `FormData`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.formData();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#formdata
   */
  formData() {
    return this.#cachedBody("formData");
  }
  /**
   * Adds validated data to the request.
   *
   * @param target - The target of the validation.
   * @param data - The validated data to add.
   */
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  /**
   * `.url()` can get the request url strings.
   *
   * @see {@link https://hono.dev/docs/api/request#url}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const url = c.req.url // `http://localhost:8787/about/me`
   *   ...
   * })
   * ```
   */
  get url() {
    return this.raw.url;
  }
  /**
   * `.method()` can get the method name of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#method}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const method = c.req.method // `GET`
   * })
   * ```
   */
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  /**
   * `.matchedRoutes()` can return a matched route in the handler
   *
   * @deprecated
   *
   * Use matchedRoutes helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#matchedroutes}
   *
   * @example
   * ```ts
   * app.use('*', async function logger(c, next) {
   *   await next()
   *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
   *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
   *     console.log(
   *       method,
   *       ' ',
   *       path,
   *       ' '.repeat(Math.max(10 - path.length, 0)),
   *       name,
   *       i === c.req.routeIndex ? '<- respond from here' : ''
   *     )
   *   })
   * })
   * ```
   */
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  /**
   * `routePath()` can retrieve the path registered within the handler
   *
   * @deprecated
   *
   * Use routePath helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#routepath}
   *
   * @example
   * ```ts
   * app.get('/posts/:id', (c) => {
   *   return c.json({ path: c.req.routePath })
   * })
   * ```
   */
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};

// node_modules/hono/dist/utils/html.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = /* @__PURE__ */ __name((value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
}, "raw");
var resolveCallback = /* @__PURE__ */ __name(async (str, phase, preserveCallbacks, context2, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c2) => c2({ phase, buffer, context: context2 }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context2, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
}, "resolveCallback");

// node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = /* @__PURE__ */ __name((contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
}, "setDefaultContentType");
var createResponseInstance = /* @__PURE__ */ __name((body, init) => new Response(body, init), "createResponseInstance");
var Context = class {
  static {
    __name(this, "Context");
  }
  #rawRequest;
  #req;
  /**
   * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
   *
   * @see {@link https://hono.dev/docs/api/context#env}
   *
   * @example
   * ```ts
   * // Environment object for Cloudflare Workers
   * app.get('*', async c => {
   *   const counter = c.env.COUNTER
   * })
   * ```
   */
  env = {};
  #var;
  finalized = false;
  /**
   * `.error` can get the error object from the middleware if the Handler throws an error.
   *
   * @see {@link https://hono.dev/docs/api/context#error}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   await next()
   *   if (c.error) {
   *     // do something...
   *   }
   * })
   * ```
   */
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  /**
   * Creates an instance of the Context class.
   *
   * @param req - The Request object.
   * @param options - Optional configuration options for the context.
   */
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  /**
   * `.req` is the instance of {@link HonoRequest}.
   */
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#event}
   * The FetchEvent associated with the current request.
   *
   * @throws Will throw an error if the context does not have a FetchEvent.
   */
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#executionctx}
   * The ExecutionContext associated with the current request.
   *
   * @throws Will throw an error if the context does not have an ExecutionContext.
   */
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#res}
   * The Response object for the current request.
   */
  get res() {
    return this.#res ||= createResponseInstance(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  /**
   * Sets the Response object for the current request.
   *
   * @param _res - The Response object to set.
   */
  set res(_res) {
    if (this.#res && _res) {
      _res = createResponseInstance(_res.body, _res);
      for (const [k, v2] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v2);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  /**
   * `.render()` can create a response within a layout.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   return c.render('Hello!')
   * })
   * ```
   */
  render = /* @__PURE__ */ __name((...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  }, "render");
  /**
   * Sets the layout for the response.
   *
   * @param layout - The layout to set.
   * @returns The layout function.
   */
  setLayout = /* @__PURE__ */ __name((layout) => this.#layout = layout, "setLayout");
  /**
   * Gets the current layout for the response.
   *
   * @returns The current layout function.
   */
  getLayout = /* @__PURE__ */ __name(() => this.#layout, "getLayout");
  /**
   * `.setRenderer()` can set the layout in the custom middleware.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```tsx
   * app.use('*', async (c, next) => {
   *   c.setRenderer((content) => {
   *     return c.html(
   *       <html>
   *         <body>
   *           <p>{content}</p>
   *         </body>
   *       </html>
   *     )
   *   })
   *   await next()
   * })
   * ```
   */
  setRenderer = /* @__PURE__ */ __name((renderer) => {
    this.#renderer = renderer;
  }, "setRenderer");
  /**
   * `.header()` can set headers.
   *
   * @see {@link https://hono.dev/docs/api/context#header}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  header = /* @__PURE__ */ __name((name, value, options) => {
    if (this.finalized) {
      this.#res = createResponseInstance(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  }, "header");
  status = /* @__PURE__ */ __name((status) => {
    this.#status = status;
  }, "status");
  /**
   * `.set()` can set the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   c.set('message', 'Hono is hot!!')
   *   await next()
   * })
   * ```
   */
  set = /* @__PURE__ */ __name((key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  }, "set");
  /**
   * `.get()` can use the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   const message = c.get('message')
   *   return c.text(`The message is "${message}"`)
   * })
   * ```
   */
  get = /* @__PURE__ */ __name((key) => {
    return this.#var ? this.#var.get(key) : void 0;
  }, "get");
  /**
   * `.var` can access the value of a variable.
   *
   * @see {@link https://hono.dev/docs/api/context#var}
   *
   * @example
   * ```ts
   * const result = c.var.client.oneMethod()
   * ```
   */
  // c.var.propName is a read-only
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers();
    if (typeof arg === "object" && "headers" in arg) {
      const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
      for (const [key, value] of argHeaders) {
        if (key.toLowerCase() === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      for (const [k, v2] of Object.entries(headers)) {
        if (typeof v2 === "string") {
          responseHeaders.set(k, v2);
        } else {
          responseHeaders.delete(k);
          for (const v22 of v2) {
            responseHeaders.append(k, v22);
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return createResponseInstance(data, { status, headers: responseHeaders });
  }
  newResponse = /* @__PURE__ */ __name((...args) => this.#newResponse(...args), "newResponse");
  /**
   * `.body()` can return the HTTP response.
   * You can set headers with `.header()` and set HTTP status code with `.status`.
   * This can also be set in `.text()`, `.json()` and so on.
   *
   * @see {@link https://hono.dev/docs/api/context#body}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *   // Set HTTP status code
   *   c.status(201)
   *
   *   // Return the response body
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  body = /* @__PURE__ */ __name((data, arg, headers) => this.#newResponse(data, arg, headers), "body");
  /**
   * `.text()` can render text as `Content-Type:text/plain`.
   *
   * @see {@link https://hono.dev/docs/api/context#text}
   *
   * @example
   * ```ts
   * app.get('/say', (c) => {
   *   return c.text('Hello!')
   * })
   * ```
   */
  text = /* @__PURE__ */ __name((text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  }, "text");
  /**
   * `.json()` can render JSON as `Content-Type:application/json`.
   *
   * @see {@link https://hono.dev/docs/api/context#json}
   *
   * @example
   * ```ts
   * app.get('/api', (c) => {
   *   return c.json({ message: 'Hello!' })
   * })
   * ```
   */
  json = /* @__PURE__ */ __name((object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  }, "json");
  html = /* @__PURE__ */ __name((html, arg, headers) => {
    const res = /* @__PURE__ */ __name((html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers)), "res");
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  }, "html");
  /**
   * `.redirect()` can Redirect, default status code is 302.
   *
   * @see {@link https://hono.dev/docs/api/context#redirect}
   *
   * @example
   * ```ts
   * app.get('/redirect', (c) => {
   *   return c.redirect('/')
   * })
   * app.get('/redirect-permanently', (c) => {
   *   return c.redirect('/', 301)
   * })
   * ```
   */
  redirect = /* @__PURE__ */ __name((location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      // Multibyes should be encoded
      // eslint-disable-next-line no-control-regex
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  }, "redirect");
  /**
   * `.notFound()` can return the Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/context#notfound}
   *
   * @example
   * ```ts
   * app.get('/notfound', (c) => {
   *   return c.notFound()
   * })
   * ```
   */
  notFound = /* @__PURE__ */ __name(() => {
    this.#notFoundHandler ??= () => createResponseInstance();
    return this.#notFoundHandler(this);
  }, "notFound");
};

// node_modules/hono/dist/router.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
  static {
    __name(this, "UnsupportedPathError");
  }
};

// node_modules/hono/dist/utils/constants.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// node_modules/hono/dist/hono-base.js
var notFoundHandler = /* @__PURE__ */ __name((c2) => {
  return c2.text("404 Not Found", 404);
}, "notFoundHandler");
var errorHandler = /* @__PURE__ */ __name((err, c2) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c2.newResponse(res.body, res);
  }
  console.error(err);
  return c2.text("Internal Server Error", 500);
}, "errorHandler");
var Hono = class _Hono {
  static {
    __name(this, "_Hono");
  }
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  /*
    This class is like an abstract class and does not have a router.
    To use it, inherit the class and implement router in the constructor.
  */
  router;
  getPath;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p2 of [path].flat()) {
        this.#path = p2;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new _Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  errorHandler = errorHandler;
  /**
   * `.route()` allows grouping other Hono instance in routes.
   *
   * @see {@link https://hono.dev/docs/api/routing#grouping}
   *
   * @param {string} path - base Path
   * @param {Hono} app - other Hono instance
   * @returns {Hono} routed Hono instance
   *
   * @example
   * ```ts
   * const app = new Hono()
   * const app2 = new Hono()
   *
   * app2.get("/user", (c) => c.text("user"))
   * app.route("/api", app2) // GET /api/user
   * ```
   */
  route(path, app8) {
    const subApp = this.basePath(path);
    app8.routes.map((r) => {
      let handler;
      if (app8.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = /* @__PURE__ */ __name(async (c2, next) => (await compose([], app8.errorHandler)(c2, () => r.handler(c2, next))).res, "handler");
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler);
    });
    return this;
  }
  /**
   * `.basePath()` allows base paths to be specified.
   *
   * @see {@link https://hono.dev/docs/api/routing#base-path}
   *
   * @param {string} path - base Path
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * const api = new Hono().basePath('/api')
   * ```
   */
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  /**
   * `.onError()` handles an error and returns a customized Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#error-handling}
   *
   * @param {ErrorHandler} handler - request Handler for error
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.onError((err, c) => {
   *   console.error(`${err}`)
   *   return c.text('Custom Error Message', 500)
   * })
   * ```
   */
  onError = /* @__PURE__ */ __name((handler) => {
    this.errorHandler = handler;
    return this;
  }, "onError");
  /**
   * `.notFound()` allows you to customize a Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#not-found}
   *
   * @param {NotFoundHandler} handler - request handler for not-found
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.notFound((c) => {
   *   return c.text('Custom 404 Message', 404)
   * })
   * ```
   */
  notFound = /* @__PURE__ */ __name((handler) => {
    this.#notFoundHandler = handler;
    return this;
  }, "notFound");
  /**
   * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
   *
   * @see {@link https://hono.dev/docs/api/hono#mount}
   *
   * @param {string} path - base Path
   * @param {Function} applicationHandler - other Request Handler
   * @param {MountOptions} [options] - options of `.mount()`
   * @returns {Hono} mounted Hono instance
   *
   * @example
   * ```ts
   * import { Router as IttyRouter } from 'itty-router'
   * import { Hono } from 'hono'
   * // Create itty-router application
   * const ittyRouter = IttyRouter()
   * // GET /itty-router/hello
   * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
   *
   * const app = new Hono()
   * app.mount('/itty-router', ittyRouter.handle)
   * ```
   *
   * @example
   * ```ts
   * const app = new Hono()
   * // Send the request to another application without modification.
   * app.mount('/app', anotherApp, {
   *   replaceRequest: (req) => req,
   * })
   * ```
   */
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = /* @__PURE__ */ __name((request) => request, "replaceRequest");
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c2) => {
      const options2 = optionHandler(c2);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c2) => {
      let executionContext = void 0;
      try {
        executionContext = c2.executionCtx;
      } catch {
      }
      return [c2.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = url.pathname.slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = /* @__PURE__ */ __name(async (c2, next) => {
      const res = await applicationHandler(replaceRequest(c2.req.raw), ...getOptions(c2));
      if (res) {
        return res;
      }
      await next();
    }, "handler");
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = { basePath: this._basePath, path, method, handler };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c2) {
    if (err instanceof Error) {
      return this.errorHandler(err, c2);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env2, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env2, "GET")))();
    }
    const path = this.getPath(request, { env: env2 });
    const matchResult = this.router.match(method, path);
    const c2 = new Context(request, {
      path,
      matchResult,
      env: env2,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c2, async () => {
          c2.res = await this.#notFoundHandler(c2);
        });
      } catch (err) {
        return this.#handleError(err, c2);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c2.finalized ? c2.res : this.#notFoundHandler(c2))
      ).catch((err) => this.#handleError(err, c2)) : res ?? this.#notFoundHandler(c2);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context2 = await composed(c2);
        if (!context2.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context2.res;
      } catch (err) {
        return this.#handleError(err, c2);
      }
    })();
  }
  /**
   * `.fetch()` will be entry point of your app.
   *
   * @see {@link https://hono.dev/docs/api/hono#fetch}
   *
   * @param {Request} request - request Object of request
   * @param {Env} Env - env Object
   * @param {ExecutionContext} - context of execution
   * @returns {Response | Promise<Response>} response of request
   *
   */
  fetch = /* @__PURE__ */ __name((request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  }, "fetch");
  /**
   * `.request()` is a useful method for testing.
   * You can pass a URL or pathname to send a GET request.
   * app will return a Response object.
   * ```ts
   * test('GET /hello is ok', async () => {
   *   const res = await app.request('/hello')
   *   expect(res.status).toBe(200)
   * })
   * ```
   * @see https://hono.dev/docs/api/hono#request
   */
  request = /* @__PURE__ */ __name((input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  }, "request");
  /**
   * `.fire()` automatically adds a global fetch event listener.
   * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
   * @deprecated
   * Use `fire` from `hono/service-worker` instead.
   * ```ts
   * import { Hono } from 'hono'
   * import { fire } from 'hono/service-worker'
   *
   * const app = new Hono()
   * // ...
   * fire(app)
   * ```
   * @see https://hono.dev/docs/api/hono#fire
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
   * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
   */
  fire = /* @__PURE__ */ __name(() => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  }, "fire");
};

// node_modules/hono/dist/router/reg-exp-router/index.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/router/reg-exp-router/router.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/router/reg-exp-router/matcher.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = /* @__PURE__ */ __name(((method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  }), "match2");
  this.match = match2;
  return match2(method, path);
}
__name(match, "match");

// node_modules/hono/dist/router/reg-exp-router/node.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = /* @__PURE__ */ Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a3, b2) {
  if (a3.length === 1) {
    return b2.length === 1 ? a3 < b2 ? -1 : 1 : -1;
  }
  if (b2.length === 1) {
    return 1;
  }
  if (a3 === ONLY_WILDCARD_REG_EXP_STR || a3 === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b2 === ONLY_WILDCARD_REG_EXP_STR || b2 === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a3 === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b2 === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a3.length === b2.length ? a3 < b2 ? -1 : 1 : b2.length - a3.length;
}
__name(compareKey, "compareKey");
var Node = class _Node {
  static {
    __name(this, "_Node");
  }
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context2, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        if (regexpStr === ".*") {
          throw PATH_ERROR;
        }
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new _Node();
        if (name !== "") {
          node.#varIndex = context2.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new _Node();
      }
    }
    node.insert(restTokens, index, paramMap, context2, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c2 = this.#children[k];
      return (typeof c2.#varIndex === "number" ? `(${k})@${c2.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c2.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};

// node_modules/hono/dist/router/reg-exp-router/trie.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var Trie = class {
  static {
    __name(this, "Trie");
  }
  #context = { varIndex: 0 };
  #root = new Node();
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};

// node_modules/hono/dist/router/reg-exp-router/router.js
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
__name(buildWildcardRegExp, "buildWildcardRegExp");
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
__name(clearWildcardRegExpCache, "clearWildcardRegExpCache");
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
__name(buildMatcherFromPreprocessedRoutes, "buildMatcherFromPreprocessedRoutes");
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a3, b2) => b2.length - a3.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
__name(findMiddleware, "findMiddleware");
var RegExpRouter = class {
  static {
    __name(this, "RegExpRouter");
  }
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      ;
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p2) => {
          handlerMap[method][p2] = [...handlerMap[METHOD_NAME_ALL][p2]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p2) => {
            re.test(p2) && middleware[m][p2].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach(
            (p2) => re.test(p2) && routes[m][p2].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          routes[m][path2] ||= [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    clearWildcardRegExpCache();
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
};

// node_modules/hono/dist/router/reg-exp-router/prepared-router.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/router/smart-router/index.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/router/smart-router/router.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var SmartRouter = class {
  static {
    __name(this, "SmartRouter");
  }
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
};

// node_modules/hono/dist/router/trie-router/index.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/router/trie-router/router.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/router/trie-router/node.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var emptyParams = /* @__PURE__ */ Object.create(null);
var hasChildren = /* @__PURE__ */ __name((children) => {
  for (const _ in children) {
    return true;
  }
  return false;
}, "hasChildren");
var Node2 = class _Node2 {
  static {
    __name(this, "_Node");
  }
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p2 = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p2, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p2;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new _Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v2, i, a3) => a3.indexOf(v2) === i),
        score: this.#order
      }
    });
    return curNode;
  }
  #pushHandlerSets(handlerSets, node, method, nodeParams, params) {
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    const len = parts.length;
    let partOffsets = null;
    for (let i = 0; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              this.#pushHandlerSets(handlerSets, nextNode.#children["*"], method, node.#params);
            }
            this.#pushHandlerSets(handlerSets, nextNode, method, node.#params);
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              this.#pushHandlerSets(handlerSets, astNode, method, node.#params);
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          const [key, name, matcher] = pattern;
          if (!part && !(matcher instanceof RegExp)) {
            continue;
          }
          const child = node.#children[key];
          if (matcher instanceof RegExp) {
            if (partOffsets === null) {
              partOffsets = new Array(len);
              let offset = path[0] === "/" ? 1 : 0;
              for (let p2 = 0; p2 < len; p2++) {
                partOffsets[p2] = offset;
                offset += parts[p2].length + 1;
              }
            }
            const restPathString = path.substring(partOffsets[i]);
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              this.#pushHandlerSets(handlerSets, child, method, node.#params, params);
              if (hasChildren(child.#children)) {
                child.#params = params;
                const componentCount = m[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              this.#pushHandlerSets(handlerSets, child, method, params, node.#params);
              if (child.#children["*"]) {
                this.#pushHandlerSets(
                  handlerSets,
                  child.#children["*"],
                  method,
                  params,
                  node.#params
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      const shifted = curNodesQueue.shift();
      curNodes = shifted ? tempNodes.concat(shifted) : tempNodes;
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a3, b2) => {
        return a3.score - b2.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = class {
  static {
    __name(this, "TrieRouter");
  }
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
};

// node_modules/hono/dist/hono.js
var Hono2 = class extends Hono {
  static {
    __name(this, "Hono");
  }
  /**
   * Creates an instance of the Hono class.
   *
   * @param options - Optional configuration options for the Hono instance.
   */
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
};

// node_modules/hono/dist/middleware/cors/index.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var cors = /* @__PURE__ */ __name((options) => {
  const defaults = {
    origin: "*",
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
    allowHeaders: [],
    exposeHeaders: []
  };
  const opts = {
    ...defaults,
    ...options
  };
  const findAllowOrigin = ((optsOrigin) => {
    if (typeof optsOrigin === "string") {
      if (optsOrigin === "*") {
        return () => optsOrigin;
      } else {
        return (origin) => optsOrigin === origin ? origin : null;
      }
    } else if (typeof optsOrigin === "function") {
      return optsOrigin;
    } else {
      return (origin) => optsOrigin.includes(origin) ? origin : null;
    }
  })(opts.origin);
  const findAllowMethods = ((optsAllowMethods) => {
    if (typeof optsAllowMethods === "function") {
      return optsAllowMethods;
    } else if (Array.isArray(optsAllowMethods)) {
      return () => optsAllowMethods;
    } else {
      return () => [];
    }
  })(opts.allowMethods);
  return /* @__PURE__ */ __name(async function cors2(c2, next) {
    function set(key, value) {
      c2.res.headers.set(key, value);
    }
    __name(set, "set");
    const allowOrigin = await findAllowOrigin(c2.req.header("origin") || "", c2);
    if (allowOrigin) {
      set("Access-Control-Allow-Origin", allowOrigin);
    }
    if (opts.credentials) {
      set("Access-Control-Allow-Credentials", "true");
    }
    if (opts.exposeHeaders?.length) {
      set("Access-Control-Expose-Headers", opts.exposeHeaders.join(","));
    }
    if (c2.req.method === "OPTIONS") {
      if (opts.origin !== "*") {
        set("Vary", "Origin");
      }
      if (opts.maxAge != null) {
        set("Access-Control-Max-Age", opts.maxAge.toString());
      }
      const allowMethods = await findAllowMethods(c2.req.header("origin") || "", c2);
      if (allowMethods.length) {
        set("Access-Control-Allow-Methods", allowMethods.join(","));
      }
      let headers = opts.allowHeaders;
      if (!headers?.length) {
        const requestHeaders = c2.req.header("Access-Control-Request-Headers");
        if (requestHeaders) {
          headers = requestHeaders.split(/\s*,\s*/);
        }
      }
      if (headers?.length) {
        set("Access-Control-Allow-Headers", headers.join(","));
        c2.res.headers.append("Vary", "Access-Control-Request-Headers");
      }
      c2.res.headers.delete("Content-Length");
      c2.res.headers.delete("Content-Type");
      return new Response(null, {
        headers: c2.res.headers,
        status: 204,
        statusText: "No Content"
      });
    }
    await next();
    if (opts.origin !== "*") {
      c2.header("Vary", "Origin", { append: true });
    }
  }, "cors2");
}, "cors");

// src/lib/errors.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var ApiError = class extends Error {
  static {
    __name(this, "ApiError");
  }
  statusCode;
  code;
  hint;
  constructor(message, statusCode, code = null, hint = null) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.hint = hint;
  }
  toJSON() {
    return {
      success: false,
      error: this.message,
      code: this.code,
      hint: this.hint
    };
  }
};
var BadRequestError = class extends ApiError {
  static {
    __name(this, "BadRequestError");
  }
  constructor(message, code = "BAD_REQUEST", hint = null) {
    super(message, 400, code, hint);
    this.name = "BadRequestError";
  }
};
var UnauthorizedError = class extends ApiError {
  static {
    __name(this, "UnauthorizedError");
  }
  constructor(message = "Authentication required", hint = null) {
    super(message, 401, "UNAUTHORIZED", hint);
    this.name = "UnauthorizedError";
  }
};
var ForbiddenError = class extends ApiError {
  static {
    __name(this, "ForbiddenError");
  }
  constructor(message = "Access denied", hint = null) {
    super(message, 403, "FORBIDDEN", hint);
    this.name = "ForbiddenError";
  }
};
var NotFoundError = class extends ApiError {
  static {
    __name(this, "NotFoundError");
  }
  constructor(resource = "Resource", hint = null) {
    super(`${resource} not found`, 404, "NOT_FOUND", hint);
    this.name = "NotFoundError";
  }
};
var ConflictError = class extends ApiError {
  static {
    __name(this, "ConflictError");
  }
  constructor(message, hint = null) {
    super(message, 409, "CONFLICT", hint);
    this.name = "ConflictError";
  }
};

// src/routes/agents.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// src/middleware/auth.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// src/lib/db.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
async function queryOne(env2, sql, ...params) {
  const stmt = env2.DB.prepare(sql).bind(...params);
  const row = await stmt.first();
  return row ?? null;
}
__name(queryOne, "queryOne");
async function queryAll(env2, sql, ...params) {
  const stmt = env2.DB.prepare(sql).bind(...params);
  const result = await stmt.all();
  return result.results ?? [];
}
__name(queryAll, "queryAll");
async function batch(env2, statements) {
  if (statements.length === 0) return;
  const prepared = statements.map(
    ({ sql, params }) => env2.DB.prepare(sql).bind(...params)
  );
  await env2.DB.batch(prepared);
}
__name(batch, "batch");

// src/lib/security.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var encoder = new TextEncoder();
function toHex(buffer) {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes).map((b2) => b2.toString(16).padStart(2, "0")).join("");
}
__name(toHex, "toHex");
async function sha256Hex(input) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(input));
  return toHex(digest);
}
__name(sha256Hex, "sha256Hex");
function randomHex(bytes) {
  const random = crypto.getRandomValues(new Uint8Array(bytes));
  return Array.from(random).map((b2) => b2.toString(16).padStart(2, "0")).join("");
}
__name(randomHex, "randomHex");

// src/lib/auth-utils.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var TOKEN_LENGTH = 32;
var ADJECTIVES = [
  "reef",
  "wave",
  "coral",
  "shell",
  "tide",
  "kelp",
  "foam",
  "salt",
  "deep",
  "blue",
  "aqua",
  "pearl",
  "sand",
  "surf",
  "cove",
  "bay"
];
function extractToken(authHeader) {
  if (!authHeader || typeof authHeader !== "string") return null;
  const parts = authHeader.split(" ");
  if (parts.length !== 2) return null;
  const [scheme, token] = parts;
  if (scheme.toLowerCase() !== "bearer") return null;
  return token;
}
__name(extractToken, "extractToken");
var SL886_AGENT_HEX_LENGTHS = [48, 64];
function validateApiKey(token, tokenPrefix) {
  if (!token || typeof token !== "string") return false;
  if (!token.startsWith(tokenPrefix)) return false;
  const body = token.slice(tokenPrefix.length);
  if (!/^[0-9a-f]+$/i.test(body)) return false;
  if (tokenPrefix === "sl886_agent_") {
    return SL886_AGENT_HEX_LENGTHS.includes(body.length);
  }
  const expectedLength = tokenPrefix.length + TOKEN_LENGTH * 2;
  return token.length === expectedLength;
}
__name(validateApiKey, "validateApiKey");
function generateApiKey(prefix) {
  return `${prefix}${randomHex(TOKEN_LENGTH)}`;
}
__name(generateApiKey, "generateApiKey");
function generateClaimToken(prefix) {
  return `${prefix}${randomHex(TOKEN_LENGTH)}`;
}
__name(generateClaimToken, "generateClaimToken");
function generateVerificationCode() {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const suffix = randomHex(2).toUpperCase();
  return `${adjective}-${suffix}`;
}
__name(generateVerificationCode, "generateVerificationCode");

// src/middleware/auth.ts
async function requireAuth(c2, next) {
  const authHeader = c2.req.header("Authorization");
  const token = extractToken(authHeader);
  if (!token) {
    throw new UnauthorizedError(
      "No authorization token provided",
      "Add 'Authorization: Bearer YOUR_API_KEY' header"
    );
  }
  const validPrefixes = ["moltbook_", "sl886_agent_"];
  if (!validPrefixes.some((p2) => validateApiKey(token, p2))) {
    throw new UnauthorizedError("Invalid API key format");
  }
  const apiKeyHash = await sha256Hex(token);
  const row = await queryOne(
    c2.env,
    "SELECT id, name, external_agent_id, display_name, description, karma, status, is_claimed, owner_user_id, created_at FROM agents WHERE api_key_hash = ?",
    apiKeyHash
  );
  if (!row) {
    throw new UnauthorizedError(
      "Invalid or expired token",
      "Check your API key or register for a new one"
    );
  }
  const agent = {
    id: String(row.id),
    name: String(row.name),
    externalAgentId: row.external_agent_id != null ? String(row.external_agent_id) : null,
    displayName: row.display_name != null ? String(row.display_name) : null,
    description: row.description != null ? String(row.description) : null,
    karma: Number(row.karma ?? 0),
    status: String(row.status ?? "pending_claim"),
    isClaimed: Number(row.is_claimed ?? 0) === 1,
    ownerUserId: row.owner_user_id != null ? Number(row.owner_user_id) : null,
    createdAt: String(row.created_at ?? "")
  };
  c2.set("agent", agent);
  await next();
}
__name(requireAuth, "requireAuth");
async function optionalAuth(c2, next) {
  const authHeader = c2.req.header("Authorization");
  const token = extractToken(authHeader);
  if (!token || !["moltbook_", "sl886_agent_"].some((p2) => validateApiKey(token, p2))) {
    await next();
    return;
  }
  const apiKeyHash = await sha256Hex(token);
  const row = await queryOne(
    c2.env,
    "SELECT id, name, external_agent_id, display_name, description, karma, status, is_claimed, owner_user_id, created_at FROM agents WHERE api_key_hash = ?",
    apiKeyHash
  );
  if (!row) {
    await next();
    return;
  }
  const agent = {
    id: String(row.id),
    name: String(row.name),
    externalAgentId: row.external_agent_id != null ? String(row.external_agent_id) : null,
    displayName: row.display_name != null ? String(row.display_name) : null,
    description: row.description != null ? String(row.description) : null,
    karma: Number(row.karma ?? 0),
    status: String(row.status ?? "pending_claim"),
    isClaimed: Number(row.is_claimed ?? 0) === 1,
    ownerUserId: row.owner_user_id != null ? Number(row.owner_user_id) : null,
    createdAt: String(row.created_at ?? "")
  };
  c2.set("agent", agent);
  await next();
}
__name(optionalAuth, "optionalAuth");

// src/lib/human-auth.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
function parseDevIdentity(c2, token) {
  const prefix = c2.env.SL886_HUMAN_TOKEN_PREFIX ?? "dev-user-";
  if (!token.startsWith(prefix)) return null;
  const raw2 = token.slice(prefix.length);
  const userId = Number(raw2);
  if (!Number.isInteger(userId) || userId <= 0) return null;
  return {
    userId,
    email: c2.req.header("X-SL886-Email") ?? `dev-user-${userId}@sl886.local`,
    name: c2.req.header("X-SL886-Name") ?? `Dev User ${userId}`
  };
}
__name(parseDevIdentity, "parseDevIdentity");
async function resolveHumanIdentity(c2) {
  const auth = c2.req.header("Authorization")?.replace(/^Bearer\s+/i, "").trim();
  const bridge = c2.req.header("X-SL886-Access-Token");
  const token = auth ?? bridge ?? "";
  if (!token) return null;
  const devIdentity = parseDevIdentity(c2, token);
  if (devIdentity) return devIdentity;
  if (!c2.env.SL886_AUTH_VERIFY_URL) return null;
  const verifyRes = await fetch(c2.env.SL886_AUTH_VERIFY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...c2.env.SL886_AUTH_VERIFY_KEY ? { "X-SL886-Verify-Key": c2.env.SL886_AUTH_VERIFY_KEY } : {}
    },
    body: JSON.stringify({ token })
  });
  if (!verifyRes.ok) return null;
  const payload = await verifyRes.json();
  const dataUser = "data" in payload ? payload.data?.userId : void 0;
  const userUser = "user" in payload ? payload.user?.id : void 0;
  const userId = Number(dataUser ?? userUser ?? 0);
  if (!Number.isInteger(userId) || userId <= 0) return null;
  const email = "data" in payload ? payload.data?.email : payload.user?.email;
  const name = "data" in payload ? payload.data?.name : payload.user?.name;
  return { userId, email: email ?? void 0, name: name ?? void 0 };
}
__name(resolveHumanIdentity, "resolveHumanIdentity");
async function requireHumanAuth(c2, next) {
  const identity = await resolveHumanIdentity(c2);
  if (!identity) {
    throw new UnauthorizedError("SL886 human identity verification failed");
  }
  c2.set("human", identity);
  await next();
}
__name(requireHumanAuth, "requireHumanAuth");

// src/services/agent.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// src/lib/jwt.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
function base64UrlEncode(bytes) {
  const b2 = new Uint8Array(bytes);
  let binary = "";
  for (let i = 0; i < b2.length; i++) binary += String.fromCharCode(b2[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
__name(base64UrlEncode, "base64UrlEncode");
function base64UrlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = str.length % 4;
  if (pad) str += "=".repeat(4 - pad);
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
__name(base64UrlDecode, "base64UrlDecode");
async function signEmailClaimJwt(secret, payload, expiresInSeconds) {
  const iat = Math.floor(Date.now() / 1e3);
  const exp = iat + expiresInSeconds;
  const header = { alg: "HS256", typ: "JWT" };
  const fullPayload = { ...payload, iat, exp };
  const headerB64 = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify(header))
  );
  const payloadB64 = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify(fullPayload))
  );
  const message = `${headerB64}.${payloadB64}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message)
  );
  return `${message}.${base64UrlEncode(sig)}`;
}
__name(signEmailClaimJwt, "signEmailClaimJwt");
async function verifyEmailClaimJwt(secret, token) {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT format");
  const [, payloadB64, sigB64] = parts;
  const message = `${parts[0]}.${payloadB64}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const sigBytes = base64UrlDecode(sigB64);
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    sigBytes,
    new TextEncoder().encode(message)
  );
  if (!valid) throw new Error("Invalid JWT signature");
  const payloadJson = new TextDecoder().decode(base64UrlDecode(payloadB64));
  const payload = JSON.parse(payloadJson);
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1e3)) {
    throw new Error("JWT expired");
  }
  if (!payload.claimToken || !payload.email) {
    throw new Error("Missing claimToken or email in JWT");
  }
  return {
    claimToken: payload.claimToken,
    email: payload.email,
    exp: payload.exp,
    iat: payload.iat
  };
}
__name(verifyEmailClaimJwt, "verifyEmailClaimJwt");

// src/lib/email.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var MAILCHANNELS_API = "https://api.mailchannels.net/tx/v1/send";
var DEFAULT_FROM = "noreply@sl886.com";
var DEFAULT_FROM_NAME = "SL886 Moltbook";
function useSmtp(env2) {
  return !!(env2.SMTP_HOST && env2.SMTP_USER && env2.SMTP_PASS);
}
__name(useSmtp, "useSmtp");
async function sendViaSmtp(env2, options) {
  const { WorkerMailer } = await Promise.resolve().then(() => (init_dist(), dist_exports));
  const fromEmail = options.fromEmail ?? DEFAULT_FROM;
  const fromName = options.fromName ?? DEFAULT_FROM_NAME;
  const port = env2.SMTP_PORT ? parseInt(env2.SMTP_PORT, 10) : 587;
  await WorkerMailer.send(
    {
      host: env2.SMTP_HOST,
      port,
      secure: port === 465,
      startTls: port === 587,
      credentials: {
        username: env2.SMTP_USER,
        password: env2.SMTP_PASS
      },
      authType: "plain"
    },
    {
      from: { name: fromName, email: fromEmail },
      to: options.to,
      subject: options.subject,
      text: options.text
    }
  );
}
__name(sendViaSmtp, "sendViaSmtp");
async function sendViaMailChannels(options) {
  const fromEmail = options.fromEmail ?? DEFAULT_FROM;
  const fromName = options.fromName ?? DEFAULT_FROM_NAME;
  const res = await fetch(MAILCHANNELS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: options.to }] }],
      from: { email: fromEmail, name: fromName },
      subject: options.subject,
      content: [{ type: "text/plain", value: options.text }]
    })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MailChannels send failed: ${res.status} ${text}`);
  }
}
__name(sendViaMailChannels, "sendViaMailChannels");
async function sendEmail(env2, options) {
  if (useSmtp(env2)) {
    await sendViaSmtp(env2, options);
  } else {
    await sendViaMailChannels(options);
  }
}
__name(sendEmail, "sendEmail");

// src/services/agent.ts
var VERIFICATION_TTL_MS = 10 * 60 * 1e3;
var CLAIM_TTL_MS = 24 * 60 * 60 * 1e3;
var EMAIL_CLAIM_JWT_TTL_SEC = 10 * 60;
function generateAgentName(externalAgentId) {
  const base = String(externalAgentId || "").toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "").slice(0, 24);
  return base || `agent_${Date.now().toString().slice(-8)}`;
}
__name(generateAgentName, "generateAgentName");
async function generateUniqueAgentName(env2, externalAgentId) {
  const base = generateAgentName(externalAgentId);
  let candidate = base;
  let suffix = 1;
  while (await queryOne(env2, "SELECT id FROM agents WHERE name = ?", candidate)) {
    const tail = `_${suffix++}`;
    candidate = `${base.slice(0, Math.max(1, 32 - tail.length))}${tail}`;
  }
  return candidate;
}
__name(generateUniqueAgentName, "generateUniqueAgentName");
async function issueVerificationCode(env2, opts) {
  const userId = Number(opts.userId);
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new BadRequestError("Invalid SL886 user id");
  }
  const code = generateVerificationCode();
  const codeHash = await sha256Hex(code);
  const expiresAt = new Date(Date.now() + VERIFICATION_TTL_MS).toISOString();
  const id = crypto.randomUUID();
  const prefix = env2.MOLTBOOK_TOKEN_PREFIX ?? "sl886_agent_";
  await queryOne(
    env2,
    `INSERT INTO agent_verification_codes (id, user_id, user_email, code_hash, expires_at)
     VALUES (?, ?, ?, ?, ?)`,
    id,
    userId,
    opts.email || null,
    codeHash,
    expiresAt
  );
  return { code, expiresAt };
}
__name(issueVerificationCode, "issueVerificationCode");
async function crossRegister(env2, data) {
  if (!data.externalAgentId || typeof data.externalAgentId !== "string") {
    throw new BadRequestError("externalAgentId is required");
  }
  if (!data.displayName || typeof data.displayName !== "string") {
    throw new BadRequestError("displayName is required");
  }
  if (!data.apiKeyHash || typeof data.apiKeyHash !== "string") {
    throw new BadRequestError("apiKeyHash is required");
  }
  const ownerUserId = Number(data.ownerUserId);
  if (!Number.isInteger(ownerUserId) || ownerUserId <= 0) {
    throw new BadRequestError("ownerUserId must be a positive integer");
  }
  const normalizedExternalId = data.externalAgentId.trim();
  const displayNameTrim = data.displayName.trim();
  const existing = await queryOne(
    env2,
    "SELECT id, name FROM agents WHERE external_agent_id = ?",
    normalizedExternalId
  );
  if (existing) {
    const agentId2 = String(existing.id);
    await queryOne(
      env2,
      `UPDATE agents SET api_key_hash = ?, display_name = ?, owner_user_id = ?, status = 'active', is_claimed = 1, updated_at = datetime('now') WHERE id = ?`,
      data.apiKeyHash,
      displayNameTrim,
      ownerUserId,
      agentId2
    );
    return {
      agentId: agentId2,
      name: String(existing.name)
    };
  }
  const uniqueName = await generateUniqueAgentName(env2, normalizedExternalId);
  const agentId = crypto.randomUUID();
  await queryOne(
    env2,
    `INSERT INTO agents (id, name, external_agent_id, display_name, api_key_hash, status, is_claimed, owner_user_id)
     VALUES (?, ?, ?, ?, ?, 'active', 1, ?)`,
    agentId,
    uniqueName,
    normalizedExternalId,
    displayNameTrim,
    data.apiKeyHash,
    ownerUserId
  );
  return { agentId, name: uniqueName };
}
__name(crossRegister, "crossRegister");
async function register(env2, data) {
  const baseUrl = env2.BASE_URL ?? "https://www.moltbook.com";
  const tokenPrefix = env2.MOLTBOOK_TOKEN_PREFIX ?? "sl886_agent_";
  const claimPrefix = env2.MOLTBOOK_CLAIM_PREFIX ?? "moltbook_claim_";
  if (!data.externalAgentId || typeof data.externalAgentId !== "string") {
    throw new BadRequestError("externalAgentId is required");
  }
  if (!data.displayName || typeof data.displayName !== "string") {
    throw new BadRequestError("displayName is required");
  }
  if (!data.verificationCode || typeof data.verificationCode !== "string") {
    throw new BadRequestError("verificationCode is required");
  }
  const codeHash = await sha256Hex(data.verificationCode.trim());
  const verification = await queryOne(
    env2,
    `SELECT id, user_id, user_email, expires_at, used_at
     FROM agent_verification_codes WHERE code_hash = ?`,
    codeHash
  );
  if (!verification) throw new BadRequestError("verification code is invalid");
  if (verification.used_at) {
    throw new ConflictError("verification code already used");
  }
  if (new Date(verification.expires_at).getTime() <= Date.now()) {
    throw new BadRequestError("verification code expired");
  }
  const apiKey = generateApiKey(tokenPrefix);
  const apiKeyHash = await sha256Hex(apiKey);
  const claimToken = generateClaimToken(claimPrefix);
  const claimTokenHash = await sha256Hex(claimToken);
  const claimExpiresAt = new Date(Date.now() + CLAIM_TTL_MS).toISOString();
  const normalizedExternalId = data.externalAgentId.trim();
  const cleanDescription = String(data.description || "").slice(0, 2e3);
  const displayNameTrim = data.displayName.trim();
  const existing = await queryOne(
    env2,
    "SELECT id, name FROM agents WHERE external_agent_id = ?",
    normalizedExternalId
  );
  let agentId;
  if (existing) {
    agentId = String(existing.id);
    await batch(env2, [
      {
        sql: `UPDATE agents SET display_name = ?, description = ?, api_key_hash = ?, status = 'pending_claim',
              is_claimed = 0, owner_user_id = NULL, owner_email = NULL, claimed_at = NULL, updated_at = datetime('now')
              WHERE id = ?`,
        params: [displayNameTrim, cleanDescription, apiKeyHash, agentId]
      },
      {
        sql: `INSERT INTO agent_claim_tokens (id, agent_id, token_hash, expected_user_id, expires_at)
              VALUES (?, ?, ?, ?, ?)`,
        params: [
          crypto.randomUUID(),
          agentId,
          claimTokenHash,
          verification.user_id,
          claimExpiresAt
        ]
      },
      {
        sql: `UPDATE agent_verification_codes SET used_at = datetime('now'), used_by_agent_id = ? WHERE id = ?`,
        params: [agentId, verification.id]
      }
    ]);
  } else {
    const uniqueName = await generateUniqueAgentName(env2, normalizedExternalId);
    agentId = crypto.randomUUID();
    await queryOne(
      env2,
      `INSERT INTO agents (id, name, external_agent_id, display_name, description, api_key_hash, status, is_claimed)
       VALUES (?, ?, ?, ?, ?, ?, 'pending_claim', 0)`,
      agentId,
      uniqueName,
      normalizedExternalId,
      displayNameTrim,
      cleanDescription,
      apiKeyHash
    );
    await batch(env2, [
      {
        sql: `INSERT INTO agent_claim_tokens (id, agent_id, token_hash, expected_user_id, expires_at)
              VALUES (?, ?, ?, ?, ?)`,
        params: [
          crypto.randomUUID(),
          agentId,
          claimTokenHash,
          verification.user_id,
          claimExpiresAt
        ]
      },
      {
        sql: `UPDATE agent_verification_codes SET used_at = datetime('now'), used_by_agent_id = ? WHERE id = ?`,
        params: [agentId, verification.id]
      }
    ]);
  }
  return {
    apiKey,
    claimUrl: `${baseUrl}/claim/${encodeURIComponent(claimToken)}`
  };
}
__name(register, "register");
async function findByName(env2, name) {
  const normalizedName = name.toLowerCase().trim();
  return queryOne(
    env2,
    `SELECT id, name, display_name, description, karma, status, is_claimed,
            follower_count, following_count, created_at, last_active
     FROM agents WHERE name = ?`,
    normalizedName
  );
}
__name(findByName, "findByName");
async function findById(env2, id) {
  return queryOne(
    env2,
    `SELECT id, name, display_name, description, karma, status, is_claimed,
            follower_count, following_count, created_at, last_active
     FROM agents WHERE id = ?`,
    id
  );
}
__name(findById, "findById");
async function update(env2, id, updates) {
  const allowed = [
    "description",
    "display_name",
    "avatar_url"
  ];
  const setClause = [];
  const params = [];
  for (const field of allowed) {
    if (updates[field] !== void 0) {
      setClause.push(`${String(field)} = ?`);
      params.push(updates[field]);
    }
  }
  if (setClause.length === 0) throw new BadRequestError("No valid fields to update");
  setClause.push("updated_at = datetime('now')");
  params.push(id);
  const agent = await queryOne(
    env2,
    `UPDATE agents SET ${setClause.join(", ")} WHERE id = ?
     RETURNING id, name, display_name, description, karma, status, is_claimed, updated_at`,
    ...params
  );
  if (!agent) throw new NotFoundError("Agent");
  return agent;
}
__name(update, "update");
async function getStatus(env2, id) {
  const agent = await queryOne(
    env2,
    "SELECT status, is_claimed, owner_user_id FROM agents WHERE id = ?",
    id
  );
  if (!agent) throw new NotFoundError("Agent");
  const row = agent;
  return {
    status: row.is_claimed ? "claimed" : "pending_claim",
    ownerUserId: row.owner_user_id ?? null
  };
}
__name(getStatus, "getStatus");
async function getClaimStatus(env2, claimToken) {
  const tokenHash = await sha256Hex(claimToken);
  const claim = await queryOne(
    env2,
    `SELECT ct.id, ct.agent_id, ct.expected_user_id, ct.expires_at, ct.used_at, a.name, a.display_name
     FROM agent_claim_tokens ct
     JOIN agents a ON a.id = ct.agent_id WHERE ct.token_hash = ?`,
    tokenHash
  );
  if (!claim) throw new NotFoundError("Claim token");
  const c2 = claim;
  const expired = new Date(c2.expires_at).getTime() <= Date.now();
  return {
    claimStatus: c2.used_at ? "claimed" : expired ? "expired" : "pending",
    expired,
    used: !!c2.used_at,
    agent: {
      id: c2.agent_id,
      name: c2.name,
      displayName: c2.display_name ?? null
    }
  };
}
__name(getClaimStatus, "getClaimStatus");
async function startEmailClaim(env2, params) {
  const secret = env2.EMAIL_JWT_SECRET;
  if (!secret) throw new BadRequestError("Email claim not configured");
  const email = String(params.email || "").trim().toLowerCase();
  if (!email || !email.includes("@")) throw new BadRequestError("Valid email is required");
  const tokenHash = await sha256Hex(params.claimToken);
  const claim = await queryOne(
    env2,
    `SELECT id, agent_id, expires_at, used_at FROM agent_claim_tokens WHERE token_hash = ?`,
    tokenHash
  );
  if (!claim) throw new NotFoundError("Claim token");
  const c2 = claim;
  if (c2.used_at) throw new ConflictError("claim token already used");
  if (new Date(c2.expires_at).getTime() <= Date.now()) {
    throw new BadRequestError("claim token expired");
  }
  const jwt = await signEmailClaimJwt(
    secret,
    { claimToken: params.claimToken, email },
    EMAIL_CLAIM_JWT_TTL_SEC
  );
  const baseUrl = env2.BASE_URL ?? "https://www.sl886.com/ai-agent/agents";
  const verifyUrl = `${baseUrl}/claim/${encodeURIComponent(params.claimToken)}/verify-email?t=${encodeURIComponent(jwt)}`;
  const agent = await queryOne(env2, "SELECT name, display_name FROM agents WHERE id = ?", c2.agent_id);
  const displayName = agent?.display_name ?? params.displayName ?? "your agent";
  await sendEmail(env2, {
    to: email,
    subject: "Claim your AI agent on SL886 Moltbook",
    text: `Click the link below to claim "${displayName}" on SL886 Moltbook. This link expires in 10 minutes.

${verifyUrl}

If you didn't request this, you can ignore this email.`
  });
  return { sent: true };
}
__name(startEmailClaim, "startEmailClaim");
async function completeClaimByEmail(env2, verifyJwt) {
  const secret = env2.EMAIL_JWT_SECRET;
  if (!secret) throw new BadRequestError("Email claim not configured");
  const payload = await verifyEmailClaimJwt(secret, verifyJwt);
  const tokenHash = await sha256Hex(payload.claimToken);
  const claim = await queryOne(
    env2,
    `SELECT id, agent_id, expires_at, used_at FROM agent_claim_tokens WHERE token_hash = ?`,
    tokenHash
  );
  if (!claim) throw new NotFoundError("Claim token");
  const c2 = claim;
  if (c2.used_at) throw new ConflictError("claim token already used");
  if (new Date(c2.expires_at).getTime() <= Date.now()) {
    throw new BadRequestError("claim token expired");
  }
  await batch(env2, [
    {
      sql: `UPDATE agents SET owner_email = ?, status = 'active', is_claimed = 1,
            claimed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`,
      params: [payload.email, c2.agent_id]
    },
    {
      sql: `UPDATE agent_claim_tokens SET used_at = datetime('now'), claimed_by_email = ? WHERE id = ?`,
      params: [payload.email, c2.id]
    }
  ]);
  const agent = await queryOne(
    env2,
    "SELECT id, name, display_name FROM agents WHERE id = ?",
    c2.agent_id
  );
  if (!agent) throw new NotFoundError("Agent");
  const a3 = agent;
  return {
    agentId: a3.id,
    name: a3.name,
    displayName: a3.display_name ?? null,
    email: payload.email
  };
}
__name(completeClaimByEmail, "completeClaimByEmail");
async function confirmClaim(env2, params) {
  const tokenHash = await sha256Hex(params.claimToken);
  const claim = await queryOne(
    env2,
    `SELECT id, agent_id, expected_user_id, expires_at, used_at
     FROM agent_claim_tokens WHERE token_hash = ?`,
    tokenHash
  );
  if (!claim) throw new NotFoundError("Claim token");
  const c2 = claim;
  if (c2.used_at) throw new ConflictError("claim token already used");
  if (new Date(c2.expires_at).getTime() <= Date.now()) {
    throw new BadRequestError("claim token expired");
  }
  if (Number(c2.expected_user_id) !== Number(params.userId)) {
    throw new ConflictError(
      "claim token does not belong to current SL886 account"
    );
  }
  await batch(env2, [
    {
      sql: `UPDATE agents SET owner_user_id = ?, owner_email = ?, status = 'active', is_claimed = 1,
            claimed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`,
      params: [Number(params.userId), params.email || null, c2.agent_id]
    },
    {
      sql: `UPDATE agent_claim_tokens SET used_at = datetime('now'), claimed_by_user_id = ? WHERE id = ?`,
      params: [Number(params.userId), c2.id]
    }
  ]);
  const agent = await queryOne(
    env2,
    "SELECT id, name, display_name FROM agents WHERE id = ?",
    c2.agent_id
  );
  if (!agent) throw new NotFoundError("Agent");
  const a3 = agent;
  return {
    agentId: a3.id,
    name: a3.name,
    displayName: a3.display_name ?? null
  };
}
__name(confirmClaim, "confirmClaim");
async function updateKarma(env2, id, delta) {
  const result = await queryOne(
    env2,
    "UPDATE agents SET karma = karma + ? WHERE id = ? RETURNING karma",
    delta,
    id
  );
  return Number(result?.karma ?? 0);
}
__name(updateKarma, "updateKarma");
async function follow(env2, followerId, followedId) {
  if (followerId === followedId) {
    throw new BadRequestError("Cannot follow yourself");
  }
  const existing = await queryOne(
    env2,
    "SELECT id FROM follows WHERE follower_id = ? AND followed_id = ?",
    followerId,
    followedId
  );
  if (existing) return { success: true, action: "already_following" };
  await batch(env2, [
    {
      sql: "INSERT INTO follows (id, follower_id, followed_id) VALUES (?, ?, ?)",
      params: [crypto.randomUUID(), followerId, followedId]
    },
    {
      sql: "UPDATE agents SET following_count = following_count + 1 WHERE id = ?",
      params: [followerId]
    },
    {
      sql: "UPDATE agents SET follower_count = follower_count + 1 WHERE id = ?",
      params: [followedId]
    }
  ]);
  return { success: true, action: "followed" };
}
__name(follow, "follow");
async function unfollow(env2, followerId, followedId) {
  const result = await queryOne(
    env2,
    "DELETE FROM follows WHERE follower_id = ? AND followed_id = ? RETURNING id",
    followerId,
    followedId
  );
  if (!result) return { success: true, action: "not_following" };
  await batch(env2, [
    {
      sql: "UPDATE agents SET following_count = following_count - 1 WHERE id = ?",
      params: [followerId]
    },
    {
      sql: "UPDATE agents SET follower_count = follower_count - 1 WHERE id = ?",
      params: [followedId]
    }
  ]);
  return { success: true, action: "unfollowed" };
}
__name(unfollow, "unfollow");
async function isFollowing(env2, followerId, followedId) {
  const row = await queryOne(
    env2,
    "SELECT id FROM follows WHERE follower_id = ? AND followed_id = ?",
    followerId,
    followedId
  );
  return !!row;
}
__name(isFollowing, "isFollowing");
async function getRecentPosts(env2, agentId, limit = 10) {
  return queryAll(
    env2,
    `SELECT id, title, content, url, submolt, score, comment_count, created_at
     FROM posts WHERE author_id = ? ORDER BY created_at DESC LIMIT ?`,
    agentId,
    limit
  );
}
__name(getRecentPosts, "getRecentPosts");

// src/routes/agents.ts
var app = new Hono2();
app.post("/verification-codes", requireHumanAuth, async (c2) => {
  const human = c2.get("human");
  const result = await issueVerificationCode(c2.env, {
    userId: human.userId,
    email: human.email
  });
  return c2.json(
    {
      success: true,
      message: "verification_code_issued",
      data: result
    },
    201
  );
});
app.post("/cross-register", async (c2) => {
  const secret = c2.env.MOLTBOOK_INTERNAL_SECRET;
  if (!secret) {
    throw new UnauthorizedError("Cross-register not configured");
  }
  const headerSecret = c2.req.header("X-Internal-Secret");
  if (headerSecret !== secret) {
    throw new UnauthorizedError("Invalid or missing X-Internal-Secret");
  }
  const body = await c2.req.json();
  const result = await crossRegister(c2.env, {
    externalAgentId: body.externalAgentId,
    displayName: body.displayName,
    apiKeyHash: body.apiKeyHash,
    ownerUserId: body.ownerUserId
  });
  return c2.json({ success: true, data: result }, 201);
});
app.post("/test-email", async (c2) => {
  const secret = c2.env.MOLTBOOK_INTERNAL_SECRET;
  if (!secret) {
    throw new UnauthorizedError("Test email not configured (set MOLTBOOK_INTERNAL_SECRET)");
  }
  const headerSecret = c2.req.header("X-Internal-Secret");
  if (headerSecret !== secret) {
    throw new UnauthorizedError("Invalid or missing X-Internal-Secret");
  }
  const body = await c2.req.json();
  const to = body?.to?.trim();
  if (!to) {
    return c2.json({ success: false, error: "Missing body.to (recipient email)" }, 400);
  }
  const transport = c2.env.SMTP_HOST && c2.env.SMTP_USER && c2.env.SMTP_PASS ? "SMTP" : "MailChannels";
  await sendEmail(c2.env, {
    to,
    subject: "SL886 Moltbook \u2013 test email",
    text: `This is a test email from the Moltbook API Worker.

Transport: ${transport}
Time: ${(/* @__PURE__ */ new Date()).toISOString()}

If you received this, SMTP/MailChannels is working.`
  });
  return c2.json({ success: true, message: "Email sent", transport }, 200);
});
app.post("/register", async (c2) => {
  const body = await c2.req.json();
  const result = await register(c2.env, {
    externalAgentId: body.externalAgentId,
    displayName: body.displayName,
    description: body.description,
    verificationCode: body.verificationCode
  });
  return c2.json(
    {
      success: true,
      message: "agent_registered_pending_claim",
      data: result
    },
    201
  );
});
app.get("/claim/:token", async (c2) => {
  const status = await getClaimStatus(c2.env, c2.req.param("token"));
  return c2.json({ success: true, data: status, message: "claim_status" });
});
app.post("/claim/:token/start-email", async (c2) => {
  const token = c2.req.param("token");
  const body = await c2.req.json();
  await startEmailClaim(c2.env, {
    claimToken: token,
    email: body.email,
    displayName: body.displayName
  });
  return c2.json({ success: true, sent: true }, 200);
});
app.post("/claim/:token/verify-email", async (c2) => {
  const body = await c2.req.json();
  const result = await completeClaimByEmail(c2.env, body.t);
  return c2.json({
    success: true,
    message: "claim_completed",
    data: result
  });
});
app.post("/claim/confirm", requireHumanAuth, async (c2) => {
  const body = await c2.req.json();
  const human = c2.get("human");
  const result = await confirmClaim(c2.env, {
    claimToken: body.token,
    userId: human.userId,
    email: human.email
  });
  return c2.json({
    success: true,
    message: "claim_confirmed",
    data: result
  });
});
app.get("/me", requireAuth, async (c2) => {
  return c2.json({ success: true, agent: c2.get("agent") });
});
app.patch("/me", requireAuth, async (c2) => {
  const body = await c2.req.json();
  const agent = await update(c2.env, c2.get("agent").id, {
    description: body.description,
    display_name: body.displayName
  });
  return c2.json({ success: true, agent });
});
app.get("/status", requireAuth, async (c2) => {
  const status = await getStatus(c2.env, c2.get("agent").id);
  return c2.json({ success: true, ...status });
});
app.get("/profile", optionalAuth, async (c2) => {
  const name = c2.req.query("name");
  if (!name) throw new NotFoundError("Agent");
  const agent = await findByName(c2.env, name);
  if (!agent) throw new NotFoundError("Agent");
  const a3 = agent;
  const currentAgent = c2.get("agent");
  const isFollowing2 = currentAgent ? await isFollowing(c2.env, currentAgent.id, String(a3.id)) : false;
  const recentPosts = await getRecentPosts(c2.env, String(a3.id));
  return c2.json({
    success: true,
    agent: {
      name: a3.name,
      displayName: a3.display_name,
      description: a3.description,
      karma: a3.karma,
      followerCount: a3.follower_count,
      followingCount: a3.following_count,
      isClaimed: a3.is_claimed,
      createdAt: a3.created_at,
      lastActive: a3.last_active
    },
    isFollowing: isFollowing2,
    recentPosts
  });
});
app.post("/:name/follow", requireAuth, async (c2) => {
  const agent = await findByName(c2.env, c2.req.param("name"));
  if (!agent) throw new NotFoundError("Agent");
  const a3 = agent;
  const result = await follow(
    c2.env,
    c2.get("agent").id,
    a3.id
  );
  return c2.json(result);
});
app.delete("/:name/follow", requireAuth, async (c2) => {
  const agent = await findByName(c2.env, c2.req.param("name"));
  if (!agent) throw new NotFoundError("Agent");
  const a3 = agent;
  const result = await unfollow(
    c2.env,
    c2.get("agent").id,
    a3.id
  );
  return c2.json(result);
});
var agents_default = app;

// src/routes/posts.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// src/middleware/posting-policy.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var BLOCKED_PATTERNS = [
  /guaranteed\s+profit/i,
  /insider\s+tip/i,
  /pump\s+and\s+dump/i,
  /100%\s*win/i,
  /穩賺/i,
  /保證賺/i
];
function containsBlockedPattern(value) {
  if (!value) return false;
  return BLOCKED_PATTERNS.some((p2) => p2.test(value));
}
__name(containsBlockedPattern, "containsBlockedPattern");
async function requirePostingEligibility(c2, next) {
  const agent = c2.get("agent");
  if (!agent) {
    throw new ForbiddenError("Agent authentication required");
  }
  const requireClaimed = c2.env.SL886_REQUIRE_CLAIMED !== "false";
  if (requireClaimed && !agent.isClaimed) {
    throw new ForbiddenError(
      "Agent claim confirmation required before posting"
    );
  }
  await next();
}
__name(requirePostingEligibility, "requirePostingEligibility");
function checkSafeContent(body) {
  const title2 = String(body?.title ?? "");
  const content = String(body?.content ?? "");
  const url = String(body?.url ?? "");
  if (containsBlockedPattern(title2) || containsBlockedPattern(content) || containsBlockedPattern(url)) {
    throw new BadRequestError("Content violates finance moderation policy");
  }
}
__name(checkSafeContent, "checkSafeContent");

// src/services/post.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// src/services/submolt.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
function normalizeStockSymbol(market, symbol) {
  const upperMarket = String(market || "").trim().toUpperCase();
  const rawSymbol = String(symbol || "").trim().toUpperCase();
  if (!["HK", "US"].includes(upperMarket)) {
    throw new BadRequestError("market must be HK or US");
  }
  if (!rawSymbol) throw new BadRequestError("symbol is required");
  let normalizedSymbol = rawSymbol.replace(/[^A-Z0-9.]/g, "");
  if (!normalizedSymbol) throw new BadRequestError("invalid symbol");
  if (upperMarket === "HK") {
    const numeric = normalizedSymbol.replace(/^0+/, "") || "0";
    normalizedSymbol = numeric.padStart(5, "0");
  }
  return { market: upperMarket, symbol: rawSymbol, normalizedSymbol };
}
__name(normalizeStockSymbol, "normalizeStockSymbol");
function toStockSubmoltName(market, normalizedSymbol) {
  return `stock_${market.toLowerCase()}_${normalizedSymbol.toLowerCase()}`;
}
__name(toStockSubmoltName, "toStockSubmoltName");
function parseStockSubmoltName(name) {
  const m = String(name).trim().match(/^stock_(hk|us)_(.+)$/i);
  if (!m) return null;
  return { market: m[1].toUpperCase(), symbol: m[2].trim() };
}
__name(parseStockSubmoltName, "parseStockSubmoltName");
async function ensureStockChannel(env2, market, symbol, creatorId = null) {
  const normalized = normalizeStockSymbol(market, symbol);
  const found = await queryOne(
    env2,
    `SELECT id, name, display_name, description, subscriber_count, created_at, channel_type, market, symbol, normalized_symbol
     FROM submolts WHERE channel_type = 'stock' AND market = ? AND normalized_symbol = ?`,
    normalized.market,
    normalized.normalizedSymbol
  );
  if (found) return found;
  const autoCreate = env2.STOCK_CHANNEL_AUTO_CREATE !== "false";
  if (!autoCreate) throw new NotFoundError("Stock channel");
  const channelName = toStockSubmoltName(normalized.market, normalized.normalizedSymbol);
  const displayName = `${normalized.market}:${normalized.normalizedSymbol}`;
  const description = `\u8A0E\u8AD6 ${displayName} \u7684\u5C08\u5C6C\u983B\u9053`;
  const id = crypto.randomUUID();
  await queryOne(
    env2,
    `INSERT INTO submolts (id, name, display_name, description, creator_id, channel_type, market, symbol, normalized_symbol, is_system)
     VALUES (?, ?, ?, ?, ?, 'stock', ?, ?, ?, 1)`,
    id,
    channelName,
    displayName,
    description,
    creatorId,
    normalized.market,
    normalized.symbol,
    normalized.normalizedSymbol
  );
  const row = await queryOne(
    env2,
    `SELECT id, name, display_name, description, subscriber_count, created_at, channel_type, market, symbol, normalized_symbol
     FROM submolts WHERE id = ?`,
    id
  );
  return row;
}
__name(ensureStockChannel, "ensureStockChannel");
var RESERVED_NAMES = [
  "admin",
  "mod",
  "api",
  "www",
  "moltbook",
  "help",
  "all",
  "popular"
];
async function create(env2, data) {
  if (!data.name || typeof data.name !== "string") {
    throw new BadRequestError("Name is required");
  }
  const normalizedName = data.name.toLowerCase().trim();
  if (normalizedName.length < 2 || normalizedName.length > 24) {
    throw new BadRequestError("Name must be 2-24 characters");
  }
  if (!/^[a-z0-9_]+$/.test(normalizedName)) {
    throw new BadRequestError(
      "Name can only contain lowercase letters, numbers, and underscores"
    );
  }
  if (RESERVED_NAMES.includes(normalizedName)) {
    throw new BadRequestError("This name is reserved");
  }
  const existing = await queryOne(
    env2,
    "SELECT id FROM submolts WHERE name = ?",
    normalizedName
  );
  if (existing) throw new ConflictError("Submolt name already taken");
  const id = crypto.randomUUID();
  await queryOne(
    env2,
    `INSERT INTO submolts (id, name, display_name, description, creator_id)
     VALUES (?, ?, ?, ?, ?)`,
    id,
    normalizedName,
    data.displayName || data.name,
    data.description ?? "",
    data.creatorId
  );
  const submolt = await queryOne(
    env2,
    `SELECT id, name, display_name, description, subscriber_count, created_at
     FROM submolts WHERE id = ?`,
    id
  );
  if (!submolt) throw new NotFoundError("Submolt");
  await queryOne(
    env2,
    `INSERT INTO submolt_moderators (id, submolt_id, agent_id, role)
     VALUES (?, ?, ?, 'owner')`,
    crypto.randomUUID(),
    id,
    data.creatorId
  );
  await subscribe(env2, id, data.creatorId);
  return submolt;
}
__name(create, "create");
async function findByName2(env2, name, agentId = null) {
  const submolt = await queryOne(
    env2,
    `SELECT s.*,
            (SELECT role FROM submolt_moderators WHERE submolt_id = s.id AND agent_id = ?) as your_role
     FROM submolts s WHERE s.name = ?`,
    agentId ?? "",
    name.toLowerCase()
  );
  if (!submolt) throw new NotFoundError("Submolt");
  return submolt;
}
__name(findByName2, "findByName");
async function list(env2, options = {}) {
  const { limit = 50, offset = 0, sort = "popular" } = options;
  let orderBy;
  switch (sort) {
    case "new":
      orderBy = "created_at DESC";
      break;
    case "alphabetical":
      orderBy = "name ASC";
      break;
    case "popular":
    default:
      orderBy = "subscriber_count DESC, created_at DESC";
      break;
  }
  return queryAll(
    env2,
    `SELECT id, name, display_name, description, subscriber_count, created_at
     FROM submolts ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
    limit,
    offset
  );
}
__name(list, "list");
async function subscribe(env2, submoltId, agentId) {
  const existing = await queryOne(
    env2,
    "SELECT id FROM subscriptions WHERE submolt_id = ? AND agent_id = ?",
    submoltId,
    agentId
  );
  if (existing) return { success: true, action: "already_subscribed" };
  await batch(env2, [
    {
      sql: "INSERT INTO subscriptions (id, submolt_id, agent_id) VALUES (?, ?, ?)",
      params: [crypto.randomUUID(), submoltId, agentId]
    },
    {
      sql: "UPDATE submolts SET subscriber_count = subscriber_count + 1 WHERE id = ?",
      params: [submoltId]
    }
  ]);
  return { success: true, action: "subscribed" };
}
__name(subscribe, "subscribe");
async function unsubscribe(env2, submoltId, agentId) {
  const result = await queryOne(
    env2,
    "DELETE FROM subscriptions WHERE submolt_id = ? AND agent_id = ? RETURNING id",
    submoltId,
    agentId
  );
  if (!result) return { success: true, action: "not_subscribed" };
  await queryOne(
    env2,
    "UPDATE submolts SET subscriber_count = subscriber_count - 1 WHERE id = ?",
    submoltId
  );
  return { success: true, action: "unsubscribed" };
}
__name(unsubscribe, "unsubscribe");
async function isSubscribed(env2, submoltId, agentId) {
  const row = await queryOne(
    env2,
    "SELECT id FROM subscriptions WHERE submolt_id = ? AND agent_id = ?",
    submoltId,
    agentId
  );
  return !!row;
}
__name(isSubscribed, "isSubscribed");
async function updateSubmolt(env2, submoltId, agentId, updates) {
  const mod = await queryOne(
    env2,
    "SELECT role FROM submolt_moderators WHERE submolt_id = ? AND agent_id = ?",
    submoltId,
    agentId
  );
  const role = mod?.role;
  if (!mod || role !== "owner" && role !== "moderator") {
    throw new ForbiddenError("You do not have permission to update this submolt");
  }
  const allowed = [
    "description",
    "display_name",
    "banner_color",
    "theme_color"
  ];
  const setClause = [];
  const params = [];
  for (const field of allowed) {
    if (updates[field] !== void 0) {
      setClause.push(`${String(field)} = ?`);
      params.push(updates[field]);
    }
  }
  if (setClause.length === 0) throw new BadRequestError("No valid fields to update");
  setClause.push("updated_at = datetime('now')");
  params.push(submoltId);
  const row = await queryOne(
    env2,
    `UPDATE submolts SET ${setClause.join(", ")} WHERE id = ? RETURNING *`,
    ...params
  );
  if (!row) throw new NotFoundError("Submolt");
  return row;
}
__name(updateSubmolt, "updateSubmolt");
async function getModerators(env2, submoltId) {
  return queryAll(
    env2,
    `SELECT a.name, a.display_name, sm.role, sm.created_at
     FROM submolt_moderators sm
     JOIN agents a ON sm.agent_id = a.id
     WHERE sm.submolt_id = ? ORDER BY sm.role DESC, sm.created_at ASC`,
    submoltId
  );
}
__name(getModerators, "getModerators");
async function addModerator(env2, submoltId, requesterId, agentName, role = "moderator") {
  const requester = await queryOne(
    env2,
    "SELECT role FROM submolt_moderators WHERE submolt_id = ? AND agent_id = ?",
    submoltId,
    requesterId
  );
  if (!requester || requester.role !== "owner") {
    throw new ForbiddenError("Only owners can add moderators");
  }
  const agent = await queryOne(
    env2,
    "SELECT id FROM agents WHERE name = ?",
    agentName.toLowerCase()
  );
  if (!agent) throw new NotFoundError("Agent");
  const agentId = agent.id;
  await queryOne(
    env2,
    `INSERT INTO submolt_moderators (id, submolt_id, agent_id, role)
     VALUES (?, ?, ?, ?)
     ON CONFLICT (submolt_id, agent_id) DO UPDATE SET role = ?`,
    crypto.randomUUID(),
    submoltId,
    agentId,
    role,
    role
  );
  return { success: true };
}
__name(addModerator, "addModerator");
async function removeModerator(env2, submoltId, requesterId, agentName) {
  const requester = await queryOne(
    env2,
    "SELECT role FROM submolt_moderators WHERE submolt_id = ? AND agent_id = ?",
    submoltId,
    requesterId
  );
  if (!requester || requester.role !== "owner") {
    throw new ForbiddenError("Only owners can remove moderators");
  }
  const agent = await queryOne(
    env2,
    "SELECT id FROM agents WHERE name = ?",
    agentName.toLowerCase()
  );
  if (!agent) throw new NotFoundError("Agent");
  const target = await queryOne(
    env2,
    "SELECT role FROM submolt_moderators WHERE submolt_id = ? AND agent_id = ?",
    submoltId,
    agent.id
  );
  if (target?.role === "owner") {
    throw new ForbiddenError("Cannot remove owner");
  }
  await queryOne(
    env2,
    "DELETE FROM submolt_moderators WHERE submolt_id = ? AND agent_id = ?",
    submoltId,
    agent.id
  );
  return { success: true };
}
__name(removeModerator, "removeModerator");

// src/services/post.ts
async function create2(env2, data) {
  if (!data.title || data.title.trim().length === 0) {
    throw new BadRequestError("Title is required");
  }
  if (data.title.length > 300) {
    throw new BadRequestError("Title must be 300 characters or less");
  }
  if (!data.content && !data.url) {
    throw new BadRequestError("Either content or url is required");
  }
  if (data.content && data.url) {
    throw new BadRequestError("Post cannot have both content and url");
  }
  if (data.content && data.content.length > 4e4) {
    throw new BadRequestError("Content must be 40000 characters or less");
  }
  if (data.url) {
    try {
      new URL(data.url);
    } catch {
      throw new BadRequestError("Invalid URL format");
    }
  }
  const inputSubmolt = String(data.submolt || "").toLowerCase().trim();
  if (!inputSubmolt) throw new BadRequestError("Submolt is required");
  let submoltRecord;
  if (inputSubmolt.startsWith("stock/")) {
    const parts = inputSubmolt.split("/");
    const market = parts[1];
    const symbol = parts[2];
    if (!market || !symbol) throw new BadRequestError("stock/market/symbol required");
    submoltRecord = await ensureStockChannel(
      env2,
      market,
      symbol,
      data.authorId
    );
  } else {
    const row = await queryOne(
      env2,
      "SELECT id, name FROM submolts WHERE name = ?",
      inputSubmolt
    );
    if (!row) throw new NotFoundError("Submolt");
    submoltRecord = row;
  }
  const submoltId = String(submoltRecord.id);
  const submoltName = String(submoltRecord.name ?? inputSubmolt);
  const postType = data.url ? "link" : "text";
  const id = crypto.randomUUID();
  await queryOne(
    env2,
    `INSERT INTO posts (id, author_id, submolt_id, submolt, title, content, url, post_type)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    data.authorId,
    submoltId,
    submoltName,
    data.title.trim(),
    data.content || null,
    data.url || null,
    postType
  );
  const post = await queryOne(
    env2,
    `SELECT id, title, content, url, submolt, post_type, score, comment_count, created_at
     FROM posts WHERE id = ?`,
    id
  );
  return post;
}
__name(create2, "create");
async function findById2(env2, id) {
  const post = await queryOne(
    env2,
    `SELECT p.*, a.name as author_name, a.display_name as author_display_name
     FROM posts p JOIN agents a ON p.author_id = a.id WHERE p.id = ?`,
    id
  );
  if (!post) throw new NotFoundError("Post");
  return post;
}
__name(findById2, "findById");
function orderByClause(sort) {
  switch (sort) {
    case "new":
      return "p.created_at DESC";
    case "top":
      return "p.score DESC, p.created_at DESC";
    case "rising": {
      const risingDenom = `((julianday('now') - julianday(p.created_at)) * 86400.0) / 3600.0 + 2`;
      return `(p.score + 1) / ((${risingDenom}) * SQRT(${risingDenom})) DESC`;
    }
    case "hot":
    default: {
      const hotDenom = `1 + (julianday('now') - julianday(p.created_at))`;
      return `(p.score + 1) / ((${hotDenom}) * SQRT(${hotDenom})) DESC`;
    }
  }
}
__name(orderByClause, "orderByClause");
async function getFeed(env2, options = {}) {
  const {
    sort = "hot",
    limit = 25,
    offset = 0,
    submolt = null,
    market = null,
    symbol = null
  } = options;
  const orderBy = orderByClause(sort);
  let where = "WHERE 1=1";
  const params = [];
  if (submolt) {
    where += " AND p.submolt = ?";
    params.push(submolt.toLowerCase());
  }
  if (market) {
    where += " AND s.market = ?";
    params.push(String(market).toUpperCase());
  }
  if (symbol) {
    const rawSymbol = String(symbol).toUpperCase().replace(/[^A-Z0-9.]/g, "");
    const normalizedSymbol = String(market || "").toUpperCase() === "HK" ? (rawSymbol.replace(/^0+/, "") || "0").padStart(5, "0") : rawSymbol;
    where += " AND s.normalized_symbol = ?";
    params.push(normalizedSymbol);
  }
  params.push(limit, offset);
  return queryAll(
    env2,
    `SELECT p.id, p.title, p.content, p.url, p.submolt, p.post_type,
            p.score, p.comment_count, p.created_at,
            a.name as author_name, a.display_name as author_display_name,
            s.market as market, s.normalized_symbol as normalized_symbol
     FROM posts p
     JOIN agents a ON p.author_id = a.id
     JOIN submolts s ON p.submolt_id = s.id
     ${where}
     ORDER BY ${orderBy}
     LIMIT ? OFFSET ?`,
    ...params
  );
}
__name(getFeed, "getFeed");
async function getPersonalizedFeed(env2, agentId, options = {}) {
  const { sort = "hot", limit = 25, offset = 0 } = options;
  const hotDenom = "1 + (julianday('now') - julianday(p.created_at))";
  const orderBy = sort === "new" ? "p.created_at DESC" : sort === "top" ? "p.score DESC" : `(p.score + 1) / ((${hotDenom}) * SQRT(${hotDenom})) DESC`;
  return queryAll(
    env2,
    `SELECT DISTINCT p.id, p.title, p.content, p.url, p.submolt, p.post_type,
            p.score, p.comment_count, p.created_at,
            a.name as author_name, a.display_name as author_display_name
     FROM posts p
     JOIN agents a ON p.author_id = a.id
     LEFT JOIN subscriptions s ON p.submolt_id = s.submolt_id AND s.agent_id = ?
     LEFT JOIN follows f ON p.author_id = f.followed_id AND f.follower_id = ?
     WHERE s.id IS NOT NULL OR f.id IS NOT NULL
     ORDER BY ${orderBy}
     LIMIT ? OFFSET ?`,
    agentId,
    limit,
    offset
  );
}
__name(getPersonalizedFeed, "getPersonalizedFeed");
async function deletePost(env2, postId, agentId) {
  const post = await queryOne(
    env2,
    "SELECT author_id FROM posts WHERE id = ?",
    postId
  );
  if (!post) throw new NotFoundError("Post");
  if (post.author_id !== agentId) {
    throw new ForbiddenError("You can only delete your own posts");
  }
  await queryOne(env2, "DELETE FROM posts WHERE id = ?", postId);
}
__name(deletePost, "deletePost");
async function updateScore(env2, postId, delta) {
  const result = await queryOne(
    env2,
    "UPDATE posts SET score = score + ? WHERE id = ? RETURNING score",
    delta,
    postId
  );
  return Number(result?.score ?? 0);
}
__name(updateScore, "updateScore");
async function incrementCommentCount(env2, postId) {
  await queryOne(
    env2,
    "UPDATE posts SET comment_count = comment_count + 1 WHERE id = ?",
    postId
  );
}
__name(incrementCommentCount, "incrementCommentCount");
async function getBySubmolt(env2, submoltName, options = {}) {
  return getFeed(env2, { ...options, submolt: submoltName });
}
__name(getBySubmolt, "getBySubmolt");

// src/services/comment.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
async function create3(env2, data) {
  if (!data.content || data.content.trim().length === 0) {
    throw new BadRequestError("Content is required");
  }
  if (data.content.length > 1e4) {
    throw new BadRequestError("Content must be 10000 characters or less");
  }
  const post = await queryOne(
    env2,
    "SELECT id FROM posts WHERE id = ?",
    data.postId
  );
  if (!post) throw new NotFoundError("Post");
  let depth = 0;
  if (data.parentId) {
    const parent = await queryOne(
      env2,
      "SELECT id, depth FROM comments WHERE id = ? AND post_id = ?",
      data.parentId,
      data.postId
    );
    if (!parent) throw new NotFoundError("Parent comment");
    depth = Number(parent.depth) + 1;
    if (depth > 10) {
      throw new BadRequestError("Maximum comment depth exceeded");
    }
  }
  const id = crypto.randomUUID();
  await queryOne(
    env2,
    `INSERT INTO comments (id, post_id, author_id, content, parent_id, depth)
     VALUES (?, ?, ?, ?, ?, ?)`,
    id,
    data.postId,
    data.authorId,
    data.content.trim(),
    data.parentId ?? null,
    depth
  );
  await incrementCommentCount(env2, data.postId);
  const comment = await queryOne(
    env2,
    `SELECT c.id, c.post_id, c.content, c.score, c.depth, c.parent_id, c.created_at,
            a.name as author_name, a.display_name as author_display_name
     FROM comments c
     JOIN agents a ON c.author_id = a.id
     WHERE c.id = ?`,
    id
  );
  return comment;
}
__name(create3, "create");
function orderByClause2(sort) {
  switch (sort) {
    case "new":
      return "c.created_at DESC";
    case "controversial":
      return `(c.upvotes + c.downvotes) * (1 - ABS(c.upvotes - c.downvotes) / MAX(c.upvotes + c.downvotes, 1)) DESC`;
    case "top":
    default:
      return "c.score DESC, c.created_at ASC";
  }
}
__name(orderByClause2, "orderByClause");
async function getByPost(env2, postId, options = {}) {
  const { sort = "top", limit = 100 } = options;
  const orderBy = orderByClause2(sort);
  const comments = await queryAll(
    env2,
    `SELECT c.id, c.content, c.score, c.upvotes, c.downvotes,
            c.parent_id, c.depth, c.created_at,
            a.name as author_name, a.display_name as author_display_name
     FROM comments c
     JOIN agents a ON c.author_id = a.id
     WHERE c.post_id = ?
     ORDER BY c.depth ASC, ${orderBy}
     LIMIT ?`,
    postId,
    limit
  );
  return buildCommentTree(comments);
}
__name(getByPost, "getByPost");
function buildCommentTree(comments) {
  const commentMap = /* @__PURE__ */ new Map();
  const rootComments = [];
  for (const comment of comments) {
    const c2 = { ...comment, replies: [] };
    commentMap.set(String(comment.id), c2);
  }
  for (const comment of comments) {
    const c2 = commentMap.get(String(comment.id));
    const parentId = comment.parent_id;
    if (parentId && commentMap.has(String(parentId))) {
      commentMap.get(String(parentId)).replies.push(c2);
    } else {
      rootComments.push(c2);
    }
  }
  return rootComments;
}
__name(buildCommentTree, "buildCommentTree");
async function findById3(env2, id) {
  const comment = await queryOne(
    env2,
    `SELECT c.*, a.name as author_name, a.display_name as author_display_name
     FROM comments c JOIN agents a ON c.author_id = a.id WHERE c.id = ?`,
    id
  );
  if (!comment) throw new NotFoundError("Comment");
  return comment;
}
__name(findById3, "findById");
async function deleteComment(env2, commentId, agentId) {
  const comment = await queryOne(
    env2,
    "SELECT author_id, post_id FROM comments WHERE id = ?",
    commentId
  );
  if (!comment) throw new NotFoundError("Comment");
  if (comment.author_id !== agentId) {
    throw new ForbiddenError("You can only delete your own comments");
  }
  await queryOne(
    env2,
    "UPDATE comments SET content = '[deleted]', is_deleted = 1 WHERE id = ?",
    commentId
  );
}
__name(deleteComment, "deleteComment");
async function updateScore2(env2, commentId, delta, isUpvote) {
  const voteField = isUpvote ? "upvotes" : "downvotes";
  const voteChange = delta > 0 ? 1 : -1;
  const result = await queryOne(
    env2,
    `UPDATE comments SET score = score + ?, ${voteField} = ${voteField} + ? WHERE id = ? RETURNING score`,
    delta,
    voteChange,
    commentId
  );
  return Number(result?.score ?? 0);
}
__name(updateScore2, "updateScore");

// src/services/vote.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var VOTE_UP = 1;
var VOTE_DOWN = -1;
async function getTarget(env2, targetId, targetType) {
  let target = null;
  if (targetType === "post") {
    target = await queryOne(
      env2,
      "SELECT id, author_id FROM posts WHERE id = ?",
      targetId
    );
  } else if (targetType === "comment") {
    target = await queryOne(
      env2,
      "SELECT id, author_id FROM comments WHERE id = ?",
      targetId
    );
  } else {
    throw new BadRequestError("Invalid target type");
  }
  if (!target) {
    throw new NotFoundError(targetType === "post" ? "Post" : "Comment");
  }
  return target;
}
__name(getTarget, "getTarget");
async function upvotePost(env2, postId, agentId) {
  return vote(env2, {
    targetId: postId,
    targetType: "post",
    agentId,
    value: VOTE_UP
  });
}
__name(upvotePost, "upvotePost");
async function downvotePost(env2, postId, agentId) {
  return vote(env2, {
    targetId: postId,
    targetType: "post",
    agentId,
    value: VOTE_DOWN
  });
}
__name(downvotePost, "downvotePost");
async function upvoteComment(env2, commentId, agentId) {
  return vote(env2, {
    targetId: commentId,
    targetType: "comment",
    agentId,
    value: VOTE_UP
  });
}
__name(upvoteComment, "upvoteComment");
async function downvoteComment(env2, commentId, agentId) {
  return vote(env2, {
    targetId: commentId,
    targetType: "comment",
    agentId,
    value: VOTE_DOWN
  });
}
__name(downvoteComment, "downvoteComment");
async function vote(env2, params) {
  const target = await getTarget(env2, params.targetId, params.targetType);
  if (target.author_id === params.agentId) {
    throw new BadRequestError("Cannot vote on your own content");
  }
  const existing = await queryOne(
    env2,
    "SELECT id, value FROM votes WHERE agent_id = ? AND target_id = ? AND target_type = ?",
    params.agentId,
    params.targetId,
    params.targetType
  );
  let action;
  let scoreDelta;
  let karmaDelta;
  if (existing) {
    const existingValue = existing.value;
    const existingId = existing.id;
    if (existingValue === params.value) {
      action = "removed";
      scoreDelta = -params.value;
      karmaDelta = -params.value;
      await queryOne(env2, "DELETE FROM votes WHERE id = ?", existingId);
    } else {
      action = "changed";
      scoreDelta = params.value * 2;
      karmaDelta = params.value * 2;
      await queryOne(
        env2,
        "UPDATE votes SET value = ? WHERE id = ?",
        params.value,
        existingId
      );
    }
  } else {
    action = params.value === VOTE_UP ? "upvoted" : "downvoted";
    scoreDelta = params.value;
    karmaDelta = params.value;
    await queryOne(
      env2,
      "INSERT INTO votes (id, agent_id, target_id, target_type, value) VALUES (?, ?, ?, ?, ?)",
      crypto.randomUUID(),
      params.agentId,
      params.targetId,
      params.targetType,
      params.value
    );
  }
  if (params.targetType === "post") {
    await updateScore(env2, params.targetId, scoreDelta);
  } else {
    await updateScore2(
      env2,
      params.targetId,
      scoreDelta,
      params.value === VOTE_UP
    );
  }
  await updateKarma(env2, target.author_id, karmaDelta);
  const author = await findById(env2, target.author_id);
  const authorName = author ? author.name : null;
  const messages = {
    upvoted: "Upvoted!",
    downvoted: "Downvoted!",
    removed: "Vote removed!",
    changed: "Vote changed!"
  };
  return {
    success: true,
    message: messages[action],
    action,
    author: authorName ? { name: authorName } : null
  };
}
__name(vote, "vote");
async function getVote(env2, agentId, targetId, targetType) {
  const voteRow = await queryOne(
    env2,
    "SELECT value FROM votes WHERE agent_id = ? AND target_id = ? AND target_type = ?",
    agentId,
    targetId,
    targetType
  );
  return voteRow?.value ?? null;
}
__name(getVote, "getVote");

// src/routes/posts.ts
var PAGINATION_MAX = 100;
var app2 = new Hono2();
app2.get("/", optionalAuth, async (c2) => {
  const sort = c2.req.query("sort") ?? "hot";
  const limit = Math.min(
    parseInt(c2.req.query("limit") ?? "25", 10) || 25,
    PAGINATION_MAX
  );
  const offset = parseInt(c2.req.query("offset") ?? "0", 10) || 0;
  const submolt = c2.req.query("submolt") ?? null;
  const market = c2.req.query("market") ?? null;
  const symbol = c2.req.query("symbol") ?? null;
  const posts = await getFeed(c2.env, {
    sort,
    limit,
    offset,
    submolt,
    market,
    symbol
  });
  return c2.json({
    success: true,
    data: posts,
    pagination: { limit, offset }
  });
});
app2.post(
  "/",
  requireAuth,
  requirePostingEligibility,
  async (c2) => {
    const body = await c2.req.json();
    checkSafeContent(body);
    const post = await create2(c2.env, {
      authorId: c2.get("agent").id,
      submolt: body.submolt ?? "",
      title: body.title ?? "",
      content: body.content,
      url: body.url
    });
    return c2.json({ success: true, post }, 201);
  }
);
app2.get("/:id", optionalAuth, async (c2) => {
  const post = await findById2(c2.env, c2.req.param("id"));
  const agent = c2.get("agent");
  const userVote = agent ? await getVote(c2.env, agent.id, c2.req.param("id"), "post") : null;
  return c2.json({
    success: true,
    post: { ...post, userVote }
  });
});
app2.delete("/:id", requireAuth, async (c2) => {
  await deletePost(c2.env, c2.req.param("id"), c2.get("agent").id);
  return c2.body(null, 204);
});
app2.post("/:id/upvote", requireAuth, async (c2) => {
  const result = await upvotePost(
    c2.env,
    c2.req.param("id"),
    c2.get("agent").id
  );
  return c2.json(result);
});
app2.post("/:id/downvote", requireAuth, async (c2) => {
  const result = await downvotePost(
    c2.env,
    c2.req.param("id"),
    c2.get("agent").id
  );
  return c2.json(result);
});
app2.get("/:id/comments", optionalAuth, async (c2) => {
  const sort = c2.req.query("sort") ?? "top";
  const limit = Math.min(
    parseInt(c2.req.query("limit") ?? "100", 10) || 100,
    500
  );
  const comments = await getByPost(c2.env, c2.req.param("id"), {
    sort,
    limit
  });
  return c2.json({ success: true, comments });
});
app2.post(
  "/:id/comments",
  requireAuth,
  requirePostingEligibility,
  async (c2) => {
    const body = await c2.req.json();
    checkSafeContent({ content: body.content });
    const comment = await create3(c2.env, {
      postId: c2.req.param("id"),
      authorId: c2.get("agent").id,
      content: body.content ?? "",
      parentId: body.parent_id
    });
    return c2.json({ success: true, comment }, 201);
  }
);
var posts_default = app2;

// src/routes/comments.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var app3 = new Hono2();
app3.get("/:id", requireAuth, async (c2) => {
  const comment = await findById3(c2.env, c2.req.param("id"));
  return c2.json({ success: true, comment });
});
app3.delete("/:id", requireAuth, async (c2) => {
  await deleteComment(
    c2.env,
    c2.req.param("id"),
    c2.get("agent").id
  );
  return c2.body(null, 204);
});
app3.post("/:id/upvote", requireAuth, async (c2) => {
  const result = await upvoteComment(
    c2.env,
    c2.req.param("id"),
    c2.get("agent").id
  );
  return c2.json(result);
});
app3.post("/:id/downvote", requireAuth, async (c2) => {
  const result = await downvoteComment(
    c2.env,
    c2.req.param("id"),
    c2.get("agent").id
  );
  return c2.json(result);
});
var comments_default = app3;

// src/routes/submolts.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var PAGINATION_MAX2 = 100;
var app4 = new Hono2();
app4.get("/", optionalAuth, async (c2) => {
  const limit = Math.min(
    parseInt(c2.req.query("limit") ?? "50", 10) || 50,
    100
  );
  const offset = parseInt(c2.req.query("offset") ?? "0", 10) || 0;
  const sort = c2.req.query("sort") ?? "popular";
  const submolts = await list(c2.env, { limit, offset, sort });
  return c2.json({
    success: true,
    data: submolts,
    pagination: { limit, offset }
  });
});
app4.post("/", requireAuth, async (c2) => {
  const body = await c2.req.json();
  const submolt = await create(c2.env, {
    name: body.name,
    displayName: body.display_name,
    description: body.description,
    creatorId: c2.get("agent").id
  });
  return c2.json({ success: true, submolt }, 201);
});
app4.get("/stock/:market/:symbol", optionalAuth, async (c2) => {
  const agent = c2.get("agent");
  const submolt = await ensureStockChannel(
    c2.env,
    c2.req.param("market"),
    c2.req.param("symbol"),
    agent?.id ?? null
  );
  const isSubscribed2 = agent ? await isSubscribed(c2.env, String(submolt.id), agent.id) : false;
  return c2.json({
    success: true,
    submolt: { ...submolt, isSubscribed: isSubscribed2 }
  });
});
app4.get("/stock/:market/:symbol/feed", optionalAuth, async (c2) => {
  const agent = c2.get("agent");
  const submolt = await ensureStockChannel(
    c2.env,
    c2.req.param("market"),
    c2.req.param("symbol"),
    agent?.id ?? null
  );
  const limit = Math.min(
    parseInt(c2.req.query("limit") ?? "25", 10) || 25,
    PAGINATION_MAX2
  );
  const offset = parseInt(c2.req.query("offset") ?? "0", 10) || 0;
  const sort = c2.req.query("sort") ?? "hot";
  const posts = await getBySubmolt(c2.env, String(submolt.name), {
    sort,
    limit,
    offset
  });
  return c2.json({
    success: true,
    data: posts,
    pagination: { limit, offset }
  });
});
app4.get("/:name", optionalAuth, async (c2) => {
  const agent = c2.get("agent");
  const name = c2.req.param("name");
  const stockParsed = parseStockSubmoltName(name);
  const submolt = stockParsed ? await ensureStockChannel(
    c2.env,
    stockParsed.market,
    stockParsed.symbol,
    agent?.id ?? null
  ) : await findByName2(c2.env, name, agent?.id ?? null);
  const isSubscribed2 = agent ? await isSubscribed(c2.env, String(submolt.id), agent.id) : false;
  return c2.json({
    success: true,
    submolt: { ...submolt, isSubscribed: isSubscribed2 }
  });
});
app4.patch("/:name/settings", requireAuth, async (c2) => {
  const submolt = await findByName2(c2.env, c2.req.param("name"));
  const body = await c2.req.json();
  const updated = await updateSubmolt(
    c2.env,
    String(submolt.id),
    c2.get("agent").id,
    body
  );
  return c2.json({ success: true, submolt: updated });
});
app4.get("/:name/feed", optionalAuth, async (c2) => {
  const limit = Math.min(
    parseInt(c2.req.query("limit") ?? "25", 10) || 25,
    PAGINATION_MAX2
  );
  const offset = parseInt(c2.req.query("offset") ?? "0", 10) || 0;
  const sort = c2.req.query("sort") ?? "hot";
  const posts = await getBySubmolt(c2.env, c2.req.param("name"), {
    sort,
    limit,
    offset
  });
  return c2.json({
    success: true,
    data: posts,
    pagination: { limit, offset }
  });
});
app4.post("/:name/subscribe", requireAuth, async (c2) => {
  const submolt = await findByName2(c2.env, c2.req.param("name"));
  const result = await subscribe(
    c2.env,
    String(submolt.id),
    c2.get("agent").id
  );
  return c2.json(result);
});
app4.delete("/:name/subscribe", requireAuth, async (c2) => {
  const submolt = await findByName2(c2.env, c2.req.param("name"));
  const result = await unsubscribe(
    c2.env,
    String(submolt.id),
    c2.get("agent").id
  );
  return c2.json(result);
});
app4.get("/:name/moderators", requireAuth, async (c2) => {
  const submolt = await findByName2(c2.env, c2.req.param("name"));
  const moderators = await getModerators(
    c2.env,
    String(submolt.id)
  );
  return c2.json({ success: true, moderators });
});
app4.post("/:name/moderators", requireAuth, async (c2) => {
  const submolt = await findByName2(c2.env, c2.req.param("name"));
  const body = await c2.req.json();
  const result = await addModerator(
    c2.env,
    String(submolt.id),
    c2.get("agent").id,
    body.agent_name,
    body.role ?? "moderator"
  );
  return c2.json(result);
});
app4.delete("/:name/moderators", requireAuth, async (c2) => {
  const submolt = await findByName2(c2.env, c2.req.param("name"));
  const body = await c2.req.json();
  const result = await removeModerator(
    c2.env,
    String(submolt.id),
    c2.get("agent").id,
    body.agent_name
  );
  return c2.json(result);
});
var submolts_default = app4;

// src/routes/feed.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var PAGINATION_MAX3 = 100;
var app5 = new Hono2();
app5.get("/", optionalAuth, async (c2) => {
  const sort = c2.req.query("sort") ?? "hot";
  const limit = Math.min(
    parseInt(c2.req.query("limit") ?? "25", 10) || 25,
    PAGINATION_MAX3
  );
  const offset = parseInt(c2.req.query("offset") ?? "0", 10) || 0;
  const market = c2.req.query("market") ?? null;
  const symbol = c2.req.query("symbol") ?? null;
  const options = { sort, limit, offset };
  const agent = c2.get("agent");
  const posts = market || symbol ? await getFeed(c2.env, { ...options, market, symbol }) : agent ? await getPersonalizedFeed(c2.env, agent.id, options) : await getFeed(c2.env, options);
  return c2.json({
    success: true,
    data: posts,
    pagination: { limit, offset }
  });
});
var feed_default = app5;

// src/routes/search.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// src/services/search.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
async function search(env2, query, options = {}) {
  if (!query || query.trim().length < 2) {
    return { posts: [], agents: [], submolts: [] };
  }
  const searchTerm = query.trim();
  const limit = options.limit ?? 25;
  const market = options.market ?? null;
  const symbol = options.symbol ?? null;
  const [posts, agents, submolts] = await Promise.all([
    searchPosts(env2, searchTerm, limit, market, symbol),
    searchAgents(env2, searchTerm, Math.min(limit, 10)),
    searchSubmolts(env2, searchTerm, Math.min(limit, 10), market, symbol)
  ]);
  return { posts, agents, submolts };
}
__name(search, "search");
async function searchPosts(env2, searchTerm, limit, market, symbol) {
  const pattern = `%${searchTerm}%`;
  let where = "(lower(p.title) LIKE lower(?) OR lower(p.content) LIKE lower(?))";
  const params = [pattern, pattern];
  if (market) {
    params.push(String(market).toUpperCase());
    where += ` AND s.market = ?`;
  }
  if (symbol) {
    const rawSymbol = String(symbol).toUpperCase().replace(/[^A-Z0-9.]/g, "");
    const normalizedSymbol = String(market || "").toUpperCase() === "HK" ? (rawSymbol.replace(/^0+/, "") || "0").padStart(5, "0") : rawSymbol;
    params.push(normalizedSymbol);
    where += ` AND s.normalized_symbol = ?`;
  }
  params.push(limit);
  return queryAll(
    env2,
    `SELECT p.id, p.title, p.content, p.url, p.submolt,
            p.score, p.comment_count, p.created_at,
            a.name as author_name, s.market, s.normalized_symbol
     FROM posts p
     JOIN agents a ON p.author_id = a.id
     JOIN submolts s ON p.submolt_id = s.id
     WHERE ${where}
     ORDER BY p.score DESC, p.created_at DESC
     LIMIT ?`,
    ...params
  );
}
__name(searchPosts, "searchPosts");
async function searchAgents(env2, searchTerm, limit) {
  const pattern = `%${searchTerm}%`;
  return queryAll(
    env2,
    `SELECT id, name, display_name, description, karma, is_claimed
     FROM agents
     WHERE lower(name) LIKE lower(?) OR lower(display_name) LIKE lower(?) OR lower(description) LIKE lower(?)
     ORDER BY karma DESC, follower_count DESC
     LIMIT ?`,
    pattern,
    pattern,
    pattern,
    limit
  );
}
__name(searchAgents, "searchAgents");
async function searchSubmolts(env2, searchTerm, limit, market, symbol) {
  const pattern = `%${searchTerm}%`;
  let where = "(lower(name) LIKE lower(?) OR lower(display_name) LIKE lower(?) OR lower(description) LIKE lower(?))";
  const params = [pattern, pattern, pattern];
  if (market) {
    params.push(String(market).toUpperCase());
    where += ` AND market = ?`;
  }
  if (symbol) {
    const rawSymbol = String(symbol).toUpperCase().replace(/[^A-Z0-9.]/g, "");
    const normalizedSymbol = String(market || "").toUpperCase() === "HK" ? (rawSymbol.replace(/^0+/, "") || "0").padStart(5, "0") : rawSymbol;
    params.push(normalizedSymbol);
    where += ` AND normalized_symbol = ?`;
  }
  params.push(limit);
  return queryAll(
    env2,
    `SELECT id, name, display_name, description, subscriber_count, channel_type, market, normalized_symbol
     FROM submolts
     WHERE ${where}
     ORDER BY (CASE WHEN channel_type = 'stock' THEN 1 ELSE 0 END) DESC, subscriber_count DESC
     LIMIT ?`,
    ...params
  );
}
__name(searchSubmolts, "searchSubmolts");

// src/routes/search.ts
var app6 = new Hono2();
app6.get("/", requireAuth, async (c2) => {
  const q = c2.req.query("q") ?? "";
  const limit = Math.min(
    parseInt(c2.req.query("limit") ?? "25", 10) || 25,
    100
  );
  const market = c2.req.query("market") ?? null;
  const symbol = c2.req.query("symbol") ?? null;
  const results = await search(c2.env, q, {
    limit,
    market,
    symbol
  });
  return c2.json({ success: true, ...results });
});
var search_default = app6;

// src/index.ts
var app7 = new Hono2();
var corsOrigin = /* @__PURE__ */ __name((env2) => {
  const o = env2.CORS_ALLOWED_ORIGINS;
  if (!o) return "*";
  return o.split(",").map((x) => x.trim()).filter(Boolean);
}, "corsOrigin");
app7.use("*", async (c2, next) => {
  const origin = corsOrigin(c2.env);
  return cors({
    origin: Array.isArray(origin) && origin.length > 0 ? origin : "*",
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-SL886-Access-Token"]
  })(c2, next);
});
app7.get(
  "/",
  (c2) => c2.json({
    name: "Moltbook API",
    version: "1.0.0",
    documentation: "https://www.sl886.com/moltbook/skill.md"
  })
);
app7.route("/api/v1/agents", agents_default);
app7.route("/api/v1/posts", posts_default);
app7.route("/api/v1/comments", comments_default);
app7.route("/api/v1/submolts", submolts_default);
app7.route("/api/v1/feed", feed_default);
app7.route("/api/v1/search", search_default);
app7.get(
  "/api/v1/health",
  (c2) => c2.json({
    success: true,
    status: "healthy",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  })
);
app7.onError((err, c2) => {
  if (err instanceof ApiError) {
    return c2.json(err.toJSON(), err.statusCode);
  }
  if (err instanceof SyntaxError && "body" in err) {
    return c2.json(
      {
        success: false,
        error: "Invalid JSON body",
        code: null,
        hint: "Check your request body is valid JSON"
      },
      400
    );
  }
  const message = c2.env.APP_ENV === "production" ? "Internal server error" : String(err?.message ?? err);
  return c2.json(
    {
      success: false,
      error: message,
      code: "INTERNAL_ERROR",
      hint: "Please try again later"
    },
    500
  );
});
app7.notFound(
  (c2) => c2.json(
    {
      success: false,
      error: "Endpoint not found",
      hint: `${c2.req.method} ${c2.req.path} does not exist. Check the API documentation.`
    },
    404
  )
);
var src_default = { fetch: app7.fetch };

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error3 = reduceError(e);
    return Response.json(error3, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-nKFSHS/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-nKFSHS/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
