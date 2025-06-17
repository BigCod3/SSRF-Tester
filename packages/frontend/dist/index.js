function cn(o) {
  return o && o.__esModule && Object.prototype.hasOwnProperty.call(o, "default") ? o.default : o;
}
var $e, it;
function ln() {
  if (it) return $e;
  it = 1;
  function o(e) {
    return e instanceof Map ? e.clear = e.delete = e.set = function() {
      throw new Error("map is read-only");
    } : e instanceof Set && (e.add = e.clear = e.delete = function() {
      throw new Error("set is read-only");
    }), Object.freeze(e), Object.getOwnPropertyNames(e).forEach((t) => {
      const r = e[t], f = typeof r;
      (f === "object" || f === "function") && !Object.isFrozen(r) && o(r);
    }), e;
  }
  class u {
    /**
     * @param {CompiledMode} mode
     */
    constructor(t) {
      t.data === void 0 && (t.data = {}), this.data = t.data, this.isMatchIgnored = !1;
    }
    ignoreMatch() {
      this.isMatchIgnored = !0;
    }
  }
  function d(e) {
    return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
  }
  function S(e, ...t) {
    const r = /* @__PURE__ */ Object.create(null);
    for (const f in e)
      r[f] = e[f];
    return t.forEach(function(f) {
      for (const T in f)
        r[T] = f[T];
    }), /** @type {T} */
    r;
  }
  const O = "</span>", I = (e) => !!e.scope, W = (e, { prefix: t }) => {
    if (e.startsWith("language:"))
      return e.replace("language:", "language-");
    if (e.includes(".")) {
      const r = e.split(".");
      return [
        `${t}${r.shift()}`,
        ...r.map((f, T) => `${f}${"_".repeat(T + 1)}`)
      ].join(" ");
    }
    return `${t}${e}`;
  };
  class F {
    /**
     * Creates a new HTMLRenderer
     *
     * @param {Tree} parseTree - the parse tree (must support `walk` API)
     * @param {{classPrefix: string}} options
     */
    constructor(t, r) {
      this.buffer = "", this.classPrefix = r.classPrefix, t.walk(this);
    }
    /**
     * Adds texts to the output stream
     *
     * @param {string} text */
    addText(t) {
      this.buffer += d(t);
    }
    /**
     * Adds a node open to the output stream (if needed)
     *
     * @param {Node} node */
    openNode(t) {
      if (!I(t)) return;
      const r = W(
        t.scope,
        { prefix: this.classPrefix }
      );
      this.span(r);
    }
    /**
     * Adds a node close to the output stream (if needed)
     *
     * @param {Node} node */
    closeNode(t) {
      I(t) && (this.buffer += O);
    }
    /**
     * returns the accumulated buffer
    */
    value() {
      return this.buffer;
    }
    // helpers
    /**
     * Builds a span element
     *
     * @param {string} className */
    span(t) {
      this.buffer += `<span class="${t}">`;
    }
  }
  const w = (e = {}) => {
    const t = { children: [] };
    return Object.assign(t, e), t;
  };
  class L {
    constructor() {
      this.rootNode = w(), this.stack = [this.rootNode];
    }
    get top() {
      return this.stack[this.stack.length - 1];
    }
    get root() {
      return this.rootNode;
    }
    /** @param {Node} node */
    add(t) {
      this.top.children.push(t);
    }
    /** @param {string} scope */
    openNode(t) {
      const r = w({ scope: t });
      this.add(r), this.stack.push(r);
    }
    closeNode() {
      if (this.stack.length > 1)
        return this.stack.pop();
    }
    closeAllNodes() {
      for (; this.closeNode(); ) ;
    }
    toJSON() {
      return JSON.stringify(this.rootNode, null, 4);
    }
    /**
     * @typedef { import("./html_renderer").Renderer } Renderer
     * @param {Renderer} builder
     */
    walk(t) {
      return this.constructor._walk(t, this.rootNode);
    }
    /**
     * @param {Renderer} builder
     * @param {Node} node
     */
    static _walk(t, r) {
      return typeof r == "string" ? t.addText(r) : r.children && (t.openNode(r), r.children.forEach((f) => this._walk(t, f)), t.closeNode(r)), t;
    }
    /**
     * @param {Node} node
     */
    static _collapse(t) {
      typeof t != "string" && t.children && (t.children.every((r) => typeof r == "string") ? t.children = [t.children.join("")] : t.children.forEach((r) => {
        L._collapse(r);
      }));
    }
  }
  class _ extends L {
    /**
     * @param {*} options
     */
    constructor(t) {
      super(), this.options = t;
    }
    /**
     * @param {string} text
     */
    addText(t) {
      t !== "" && this.add(t);
    }
    /** @param {string} scope */
    startScope(t) {
      this.openNode(t);
    }
    endScope() {
      this.closeNode();
    }
    /**
     * @param {Emitter & {root: DataNode}} emitter
     * @param {string} name
     */
    __addSublanguage(t, r) {
      const f = t.root;
      r && (f.scope = `language:${r}`), this.add(f);
    }
    toHTML() {
      return new F(this, this.options).value();
    }
    finalize() {
      return this.closeAllNodes(), !0;
    }
  }
  function b(e) {
    return e ? typeof e == "string" ? e : e.source : null;
  }
  function E(e) {
    return m("(?=", e, ")");
  }
  function k(e) {
    return m("(?:", e, ")*");
  }
  function j(e) {
    return m("(?:", e, ")?");
  }
  function m(...e) {
    return e.map((r) => b(r)).join("");
  }
  function K(e) {
    const t = e[e.length - 1];
    return typeof t == "object" && t.constructor === Object ? (e.splice(e.length - 1, 1), t) : {};
  }
  function $(...e) {
    return "(" + (K(e).capture ? "" : "?:") + e.map((f) => b(f)).join("|") + ")";
  }
  function ce(e) {
    return new RegExp(e.toString() + "|").exec("").length - 1;
  }
  function Ee(e, t) {
    const r = e && e.exec(t);
    return r && r.index === 0;
  }
  const ye = /\[(?:[^\\\]]|\\.)*\]|\(\??|\\([1-9][0-9]*)|\\./;
  function se(e, { joinWith: t }) {
    let r = 0;
    return e.map((f) => {
      r += 1;
      const T = r;
      let A = b(f), a = "";
      for (; A.length > 0; ) {
        const i = ye.exec(A);
        if (!i) {
          a += A;
          break;
        }
        a += A.substring(0, i.index), A = A.substring(i.index + i[0].length), i[0][0] === "\\" && i[1] ? a += "\\" + String(Number(i[1]) + T) : (a += i[0], i[0] === "(" && r++);
      }
      return a;
    }).map((f) => `(${f})`).join(t);
  }
  const we = /\b\B/, le = "[a-zA-Z]\\w*", ie = "[a-zA-Z_]\\w*", de = "\\b\\d+(\\.\\d+)?", N = "(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)", Se = "\\b(0b[01]+)", ve = "!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~", ue = (e = {}) => {
    const t = /^#![ ]*\//;
    return e.binary && (e.begin = m(
      t,
      /.*\b/,
      e.binary,
      /\b.*/
    )), S({
      scope: "meta",
      begin: t,
      end: /$/,
      relevance: 0,
      /** @type {ModeCallback} */
      "on:begin": (r, f) => {
        r.index !== 0 && f.ignoreMatch();
      }
    }, e);
  }, ge = {
    begin: "\\\\[\\s\\S]",
    relevance: 0
  }, dt = {
    scope: "string",
    begin: "'",
    end: "'",
    illegal: "\\n",
    contains: [ge]
  }, ut = {
    scope: "string",
    begin: '"',
    end: '"',
    illegal: "\\n",
    contains: [ge]
  }, gt = {
    begin: /\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/
  }, xe = function(e, t, r = {}) {
    const f = S(
      {
        scope: "comment",
        begin: e,
        end: t,
        contains: []
      },
      r
    );
    f.contains.push({
      scope: "doctag",
      // hack to avoid the space from being included. the space is necessary to
      // match here to prevent the plain text rule below from gobbling up doctags
      begin: "[ ]*(?=(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):)",
      end: /(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):/,
      excludeBegin: !0,
      relevance: 0
    });
    const T = $(
      // list of common 1 and 2 letter words in English
      "I",
      "a",
      "is",
      "so",
      "us",
      "to",
      "at",
      "if",
      "in",
      "it",
      "on",
      // note: this is not an exhaustive list of contractions, just popular ones
      /[A-Za-z]+['](d|ve|re|ll|t|s|n)/,
      // contractions - can't we'd they're let's, etc
      /[A-Za-z]+[-][a-z]+/,
      // `no-way`, etc.
      /[A-Za-z][a-z]{2,}/
      // allow capitalized words at beginning of sentences
    );
    return f.contains.push(
      {
        // TODO: how to include ", (, ) without breaking grammars that use these for
        // comment delimiters?
        // begin: /[ ]+([()"]?([A-Za-z'-]{3,}|is|a|I|so|us|[tT][oO]|at|if|in|it|on)[.]?[()":]?([.][ ]|[ ]|\))){3}/
        // ---
        // this tries to find sequences of 3 english words in a row (without any
        // "programming" type syntax) this gives us a strong signal that we've
        // TRULY found a comment - vs perhaps scanning with the wrong language.
        // It's possible to find something that LOOKS like the start of the
        // comment - but then if there is no readable text - good chance it is a
        // false match and not a comment.
        //
        // for a visual example please see:
        // https://github.com/highlightjs/highlight.js/issues/2827
        begin: m(
          /[ ]+/,
          // necessary to prevent us gobbling up doctags like /* @author Bob Mcgill */
          "(",
          T,
          /[.]?[:]?([.][ ]|[ ])/,
          "){3}"
        )
        // look for 3 words in a row
      }
    ), f;
  }, ft = xe("//", "$"), ht = xe("/\\*", "\\*/"), pt = xe("#", "$"), bt = {
    scope: "number",
    begin: de,
    relevance: 0
  }, Et = {
    scope: "number",
    begin: N,
    relevance: 0
  }, yt = {
    scope: "number",
    begin: Se,
    relevance: 0
  }, wt = {
    scope: "regexp",
    begin: /\/(?=[^/\n]*\/)/,
    end: /\/[gimuy]*/,
    contains: [
      ge,
      {
        begin: /\[/,
        end: /\]/,
        relevance: 0,
        contains: [ge]
      }
    ]
  }, St = {
    scope: "title",
    begin: le,
    relevance: 0
  }, vt = {
    scope: "title",
    begin: ie,
    relevance: 0
  }, xt = {
    // excludes method names from keyword processing
    begin: "\\.\\s*" + ie,
    relevance: 0
  };
  var _e = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    APOS_STRING_MODE: dt,
    BACKSLASH_ESCAPE: ge,
    BINARY_NUMBER_MODE: yt,
    BINARY_NUMBER_RE: Se,
    COMMENT: xe,
    C_BLOCK_COMMENT_MODE: ht,
    C_LINE_COMMENT_MODE: ft,
    C_NUMBER_MODE: Et,
    C_NUMBER_RE: N,
    END_SAME_AS_BEGIN: function(e) {
      return Object.assign(
        e,
        {
          /** @type {ModeCallback} */
          "on:begin": (t, r) => {
            r.data._beginMatch = t[1];
          },
          /** @type {ModeCallback} */
          "on:end": (t, r) => {
            r.data._beginMatch !== t[1] && r.ignoreMatch();
          }
        }
      );
    },
    HASH_COMMENT_MODE: pt,
    IDENT_RE: le,
    MATCH_NOTHING_RE: we,
    METHOD_GUARD: xt,
    NUMBER_MODE: bt,
    NUMBER_RE: de,
    PHRASAL_WORDS_MODE: gt,
    QUOTE_STRING_MODE: ut,
    REGEXP_MODE: wt,
    RE_STARTERS_RE: ve,
    SHEBANG: ue,
    TITLE_MODE: St,
    UNDERSCORE_IDENT_RE: ie,
    UNDERSCORE_TITLE_MODE: vt
  });
  function _t(e, t) {
    e.input[e.index - 1] === "." && t.ignoreMatch();
  }
  function Mt(e, t) {
    e.className !== void 0 && (e.scope = e.className, delete e.className);
  }
  function Rt(e, t) {
    t && e.beginKeywords && (e.begin = "\\b(" + e.beginKeywords.split(" ").join("|") + ")(?!\\.)(?=\\b|\\s)", e.__beforeBegin = _t, e.keywords = e.keywords || e.beginKeywords, delete e.beginKeywords, e.relevance === void 0 && (e.relevance = 0));
  }
  function mt(e, t) {
    Array.isArray(e.illegal) && (e.illegal = $(...e.illegal));
  }
  function Ot(e, t) {
    if (e.match) {
      if (e.begin || e.end) throw new Error("begin & end are not supported with match");
      e.begin = e.match, delete e.match;
    }
  }
  function Nt(e, t) {
    e.relevance === void 0 && (e.relevance = 1);
  }
  const kt = (e, t) => {
    if (!e.beforeMatch) return;
    if (e.starts) throw new Error("beforeMatch cannot be used with starts");
    const r = Object.assign({}, e);
    Object.keys(e).forEach((f) => {
      delete e[f];
    }), e.keywords = r.keywords, e.begin = m(r.beforeMatch, E(r.begin)), e.starts = {
      relevance: 0,
      contains: [
        Object.assign(r, { endsParent: !0 })
      ]
    }, e.relevance = 0, delete r.beforeMatch;
  }, Tt = [
    "of",
    "and",
    "for",
    "in",
    "not",
    "or",
    "if",
    "then",
    "parent",
    // common variable name
    "list",
    // common variable name
    "value"
    // common variable name
  ], At = "keyword";
  function Ue(e, t, r = At) {
    const f = /* @__PURE__ */ Object.create(null);
    return typeof e == "string" ? T(r, e.split(" ")) : Array.isArray(e) ? T(r, e) : Object.keys(e).forEach(function(A) {
      Object.assign(
        f,
        Ue(e[A], t, A)
      );
    }), f;
    function T(A, a) {
      t && (a = a.map((i) => i.toLowerCase())), a.forEach(function(i) {
        const g = i.split("|");
        f[g[0]] = [A, Lt(g[0], g[1])];
      });
    }
  }
  function Lt(e, t) {
    return t ? Number(t) : Ct(e) ? 0 : 1;
  }
  function Ct(e) {
    return Tt.includes(e.toLowerCase());
  }
  const Je = {}, Q = (e) => {
    console.error(e);
  }, ze = (e, ...t) => {
    console.log(`WARN: ${e}`, ...t);
  }, oe = (e, t) => {
    Je[`${e}/${t}`] || (console.log(`Deprecated as of ${e}. ${t}`), Je[`${e}/${t}`] = !0);
  }, Me = new Error();
  function Ge(e, t, { key: r }) {
    let f = 0;
    const T = e[r], A = {}, a = {};
    for (let i = 1; i <= t.length; i++)
      a[i + f] = T[i], A[i + f] = !0, f += ce(t[i - 1]);
    e[r] = a, e[r]._emit = A, e[r]._multi = !0;
  }
  function It(e) {
    if (Array.isArray(e.begin)) {
      if (e.skip || e.excludeBegin || e.returnBegin)
        throw Q("skip, excludeBegin, returnBegin not compatible with beginScope: {}"), Me;
      if (typeof e.beginScope != "object" || e.beginScope === null)
        throw Q("beginScope must be object"), Me;
      Ge(e, e.begin, { key: "beginScope" }), e.begin = se(e.begin, { joinWith: "" });
    }
  }
  function Dt(e) {
    if (Array.isArray(e.end)) {
      if (e.skip || e.excludeEnd || e.returnEnd)
        throw Q("skip, excludeEnd, returnEnd not compatible with endScope: {}"), Me;
      if (typeof e.endScope != "object" || e.endScope === null)
        throw Q("endScope must be object"), Me;
      Ge(e, e.end, { key: "endScope" }), e.end = se(e.end, { joinWith: "" });
    }
  }
  function Bt(e) {
    e.scope && typeof e.scope == "object" && e.scope !== null && (e.beginScope = e.scope, delete e.scope);
  }
  function qt(e) {
    Bt(e), typeof e.beginScope == "string" && (e.beginScope = { _wrap: e.beginScope }), typeof e.endScope == "string" && (e.endScope = { _wrap: e.endScope }), It(e), Dt(e);
  }
  function Ht(e) {
    function t(a, i) {
      return new RegExp(
        b(a),
        "m" + (e.case_insensitive ? "i" : "") + (e.unicodeRegex ? "u" : "") + (i ? "g" : "")
      );
    }
    class r {
      constructor() {
        this.matchIndexes = {}, this.regexes = [], this.matchAt = 1, this.position = 0;
      }
      // @ts-ignore
      addRule(i, g) {
        g.position = this.position++, this.matchIndexes[this.matchAt] = g, this.regexes.push([g, i]), this.matchAt += ce(i) + 1;
      }
      compile() {
        this.regexes.length === 0 && (this.exec = () => null);
        const i = this.regexes.map((g) => g[1]);
        this.matcherRe = t(se(i, { joinWith: "|" }), !0), this.lastIndex = 0;
      }
      /** @param {string} s */
      exec(i) {
        this.matcherRe.lastIndex = this.lastIndex;
        const g = this.matcherRe.exec(i);
        if (!g)
          return null;
        const B = g.findIndex((fe, Ce) => Ce > 0 && fe !== void 0), C = this.matchIndexes[B];
        return g.splice(0, B), Object.assign(g, C);
      }
    }
    class f {
      constructor() {
        this.rules = [], this.multiRegexes = [], this.count = 0, this.lastIndex = 0, this.regexIndex = 0;
      }
      // @ts-ignore
      getMatcher(i) {
        if (this.multiRegexes[i]) return this.multiRegexes[i];
        const g = new r();
        return this.rules.slice(i).forEach(([B, C]) => g.addRule(B, C)), g.compile(), this.multiRegexes[i] = g, g;
      }
      resumingScanAtSamePosition() {
        return this.regexIndex !== 0;
      }
      considerAll() {
        this.regexIndex = 0;
      }
      // @ts-ignore
      addRule(i, g) {
        this.rules.push([i, g]), g.type === "begin" && this.count++;
      }
      /** @param {string} s */
      exec(i) {
        const g = this.getMatcher(this.regexIndex);
        g.lastIndex = this.lastIndex;
        let B = g.exec(i);
        if (this.resumingScanAtSamePosition() && !(B && B.index === this.lastIndex)) {
          const C = this.getMatcher(0);
          C.lastIndex = this.lastIndex + 1, B = C.exec(i);
        }
        return B && (this.regexIndex += B.position + 1, this.regexIndex === this.count && this.considerAll()), B;
      }
    }
    function T(a) {
      const i = new f();
      return a.contains.forEach((g) => i.addRule(g.begin, { rule: g, type: "begin" })), a.terminatorEnd && i.addRule(a.terminatorEnd, { type: "end" }), a.illegal && i.addRule(a.illegal, { type: "illegal" }), i;
    }
    function A(a, i) {
      const g = (
        /** @type CompiledMode */
        a
      );
      if (a.isCompiled) return g;
      [
        Mt,
        // do this early so compiler extensions generally don't have to worry about
        // the distinction between match/begin
        Ot,
        qt,
        kt
      ].forEach((C) => C(a, i)), e.compilerExtensions.forEach((C) => C(a, i)), a.__beforeBegin = null, [
        Rt,
        // do this later so compiler extensions that come earlier have access to the
        // raw array if they wanted to perhaps manipulate it, etc.
        mt,
        // default to 1 relevance if not specified
        Nt
      ].forEach((C) => C(a, i)), a.isCompiled = !0;
      let B = null;
      return typeof a.keywords == "object" && a.keywords.$pattern && (a.keywords = Object.assign({}, a.keywords), B = a.keywords.$pattern, delete a.keywords.$pattern), B = B || /\w+/, a.keywords && (a.keywords = Ue(a.keywords, e.case_insensitive)), g.keywordPatternRe = t(B, !0), i && (a.begin || (a.begin = /\B|\b/), g.beginRe = t(g.begin), !a.end && !a.endsWithParent && (a.end = /\B|\b/), a.end && (g.endRe = t(g.end)), g.terminatorEnd = b(g.end) || "", a.endsWithParent && i.terminatorEnd && (g.terminatorEnd += (a.end ? "|" : "") + i.terminatorEnd)), a.illegal && (g.illegalRe = t(
        /** @type {RegExp | string} */
        a.illegal
      )), a.contains || (a.contains = []), a.contains = [].concat(...a.contains.map(function(C) {
        return $t(C === "self" ? a : C);
      })), a.contains.forEach(function(C) {
        A(
          /** @type Mode */
          C,
          g
        );
      }), a.starts && A(a.starts, i), g.matcher = T(g), g;
    }
    if (e.compilerExtensions || (e.compilerExtensions = []), e.contains && e.contains.includes("self"))
      throw new Error("ERR: contains `self` is not supported at the top-level of a language.  See documentation.");
    return e.classNameAliases = S(e.classNameAliases || {}), A(
      /** @type Mode */
      e
    );
  }
  function We(e) {
    return e ? e.endsWithParent || We(e.starts) : !1;
  }
  function $t(e) {
    return e.variants && !e.cachedVariants && (e.cachedVariants = e.variants.map(function(t) {
      return S(e, { variants: null }, t);
    })), e.cachedVariants ? e.cachedVariants : We(e) ? S(e, { starts: e.starts ? S(e.starts) : null }) : Object.isFrozen(e) ? S(e) : e;
  }
  var Pt = "11.11.1";
  class Ft extends Error {
    constructor(t, r) {
      super(t), this.name = "HTMLInjectionError", this.html = r;
    }
  }
  const Le = d, Ke = S, Xe = Symbol("nomatch"), jt = 7, Ve = function(e) {
    const t = /* @__PURE__ */ Object.create(null), r = /* @__PURE__ */ Object.create(null), f = [];
    let T = !0;
    const A = "Could not find the language '{}', did you forget to load/include a language module?", a = { disableAutodetect: !0, name: "Plain text", contains: [] };
    let i = {
      ignoreUnescapedHTML: !1,
      throwUnescapedHTML: !1,
      noHighlightRe: /^(no-?highlight)$/i,
      languageDetectRe: /\blang(?:uage)?-([\w-]+)\b/i,
      classPrefix: "hljs-",
      cssSelector: "pre code",
      languages: null,
      // beta configuration options, subject to change, welcome to discuss
      // https://github.com/highlightjs/highlight.js/issues/1086
      __emitter: _
    };
    function g(n) {
      return i.noHighlightRe.test(n);
    }
    function B(n) {
      let l = n.className + " ";
      l += n.parentNode ? n.parentNode.className : "";
      const y = i.languageDetectRe.exec(l);
      if (y) {
        const M = V(y[1]);
        return M || (ze(A.replace("{}", y[1])), ze("Falling back to no-highlight mode for this block.", n)), M ? y[1] : "no-highlight";
      }
      return l.split(/\s+/).find((M) => g(M) || V(M));
    }
    function C(n, l, y) {
      let M = "", D = "";
      typeof l == "object" ? (M = n, y = l.ignoreIllegals, D = l.language) : (oe("10.7.0", "highlight(lang, code, ...args) has been deprecated."), oe("10.7.0", `Please use highlight(code, options) instead.
https://github.com/highlightjs/highlight.js/issues/2277`), D = n, M = l), y === void 0 && (y = !0);
      const U = {
        code: M,
        language: D
      };
      me("before:highlight", U);
      const Y = U.result ? U.result : fe(U.language, U.code, y);
      return Y.code = U.code, me("after:highlight", Y), Y;
    }
    function fe(n, l, y, M) {
      const D = /* @__PURE__ */ Object.create(null);
      function U(s, c) {
        return s.keywords[c];
      }
      function Y() {
        if (!h.keywords) {
          q.addText(R);
          return;
        }
        let s = 0;
        h.keywordPatternRe.lastIndex = 0;
        let c = h.keywordPatternRe.exec(R), p = "";
        for (; c; ) {
          p += R.substring(s, c.index);
          const x = z.case_insensitive ? c[0].toLowerCase() : c[0], H = U(h, x);
          if (H) {
            const [X, on] = H;
            if (q.addText(p), p = "", D[x] = (D[x] || 0) + 1, D[x] <= jt && (ke += on), X.startsWith("_"))
              p += c[0];
            else {
              const an = z.classNameAliases[X] || X;
              J(c[0], an);
            }
          } else
            p += c[0];
          s = h.keywordPatternRe.lastIndex, c = h.keywordPatternRe.exec(R);
        }
        p += R.substring(s), q.addText(p);
      }
      function Oe() {
        if (R === "") return;
        let s = null;
        if (typeof h.subLanguage == "string") {
          if (!t[h.subLanguage]) {
            q.addText(R);
            return;
          }
          s = fe(h.subLanguage, R, !0, st[h.subLanguage]), st[h.subLanguage] = /** @type {CompiledMode} */
          s._top;
        } else
          s = Ie(R, h.subLanguage.length ? h.subLanguage : null);
        h.relevance > 0 && (ke += s.relevance), q.__addSublanguage(s._emitter, s.language);
      }
      function P() {
        h.subLanguage != null ? Oe() : Y(), R = "";
      }
      function J(s, c) {
        s !== "" && (q.startScope(c), q.addText(s), q.endScope());
      }
      function et(s, c) {
        let p = 1;
        const x = c.length - 1;
        for (; p <= x; ) {
          if (!s._emit[p]) {
            p++;
            continue;
          }
          const H = z.classNameAliases[s[p]] || s[p], X = c[p];
          H ? J(X, H) : (R = X, Y(), R = ""), p++;
        }
      }
      function tt(s, c) {
        return s.scope && typeof s.scope == "string" && q.openNode(z.classNameAliases[s.scope] || s.scope), s.beginScope && (s.beginScope._wrap ? (J(R, z.classNameAliases[s.beginScope._wrap] || s.beginScope._wrap), R = "") : s.beginScope._multi && (et(s.beginScope, c), R = "")), h = Object.create(s, { parent: { value: h } }), h;
      }
      function nt(s, c, p) {
        let x = Ee(s.endRe, p);
        if (x) {
          if (s["on:end"]) {
            const H = new u(s);
            s["on:end"](c, H), H.isMatchIgnored && (x = !1);
          }
          if (x) {
            for (; s.endsParent && s.parent; )
              s = s.parent;
            return s;
          }
        }
        if (s.endsWithParent)
          return nt(s.parent, c, p);
      }
      function en(s) {
        return h.matcher.regexIndex === 0 ? (R += s[0], 1) : (He = !0, 0);
      }
      function tn(s) {
        const c = s[0], p = s.rule, x = new u(p), H = [p.__beforeBegin, p["on:begin"]];
        for (const X of H)
          if (X && (X(s, x), x.isMatchIgnored))
            return en(c);
        return p.skip ? R += c : (p.excludeBegin && (R += c), P(), !p.returnBegin && !p.excludeBegin && (R = c)), tt(p, s), p.returnBegin ? 0 : c.length;
      }
      function nn(s) {
        const c = s[0], p = l.substring(s.index), x = nt(h, s, p);
        if (!x)
          return Xe;
        const H = h;
        h.endScope && h.endScope._wrap ? (P(), J(c, h.endScope._wrap)) : h.endScope && h.endScope._multi ? (P(), et(h.endScope, s)) : H.skip ? R += c : (H.returnEnd || H.excludeEnd || (R += c), P(), H.excludeEnd && (R = c));
        do
          h.scope && q.closeNode(), !h.skip && !h.subLanguage && (ke += h.relevance), h = h.parent;
        while (h !== x.parent);
        return x.starts && tt(x.starts, s), H.returnEnd ? 0 : c.length;
      }
      function rn() {
        const s = [];
        for (let c = h; c !== z; c = c.parent)
          c.scope && s.unshift(c.scope);
        s.forEach((c) => q.openNode(c));
      }
      let Ne = {};
      function rt(s, c) {
        const p = c && c[0];
        if (R += s, p == null)
          return P(), 0;
        if (Ne.type === "begin" && c.type === "end" && Ne.index === c.index && p === "") {
          if (R += l.slice(c.index, c.index + 1), !T) {
            const x = new Error(`0 width match regex (${n})`);
            throw x.languageName = n, x.badRule = Ne.rule, x;
          }
          return 1;
        }
        if (Ne = c, c.type === "begin")
          return tn(c);
        if (c.type === "illegal" && !y) {
          const x = new Error('Illegal lexeme "' + p + '" for mode "' + (h.scope || "<unnamed>") + '"');
          throw x.mode = h, x;
        } else if (c.type === "end") {
          const x = nn(c);
          if (x !== Xe)
            return x;
        }
        if (c.type === "illegal" && p === "")
          return R += `
`, 1;
        if (qe > 1e5 && qe > c.index * 3)
          throw new Error("potential infinite loop, way more iterations than matches");
        return R += p, p.length;
      }
      const z = V(n);
      if (!z)
        throw Q(A.replace("{}", n)), new Error('Unknown language: "' + n + '"');
      const sn = Ht(z);
      let Be = "", h = M || sn;
      const st = {}, q = new i.__emitter(i);
      rn();
      let R = "", ke = 0, ee = 0, qe = 0, He = !1;
      try {
        if (z.__emitTokens)
          z.__emitTokens(l, q);
        else {
          for (h.matcher.considerAll(); ; ) {
            qe++, He ? He = !1 : h.matcher.considerAll(), h.matcher.lastIndex = ee;
            const s = h.matcher.exec(l);
            if (!s) break;
            const c = l.substring(ee, s.index), p = rt(c, s);
            ee = s.index + p;
          }
          rt(l.substring(ee));
        }
        return q.finalize(), Be = q.toHTML(), {
          language: n,
          value: Be,
          relevance: ke,
          illegal: !1,
          _emitter: q,
          _top: h
        };
      } catch (s) {
        if (s.message && s.message.includes("Illegal"))
          return {
            language: n,
            value: Le(l),
            illegal: !0,
            relevance: 0,
            _illegalBy: {
              message: s.message,
              index: ee,
              context: l.slice(ee - 100, ee + 100),
              mode: s.mode,
              resultSoFar: Be
            },
            _emitter: q
          };
        if (T)
          return {
            language: n,
            value: Le(l),
            illegal: !1,
            relevance: 0,
            errorRaised: s,
            _emitter: q,
            _top: h
          };
        throw s;
      }
    }
    function Ce(n) {
      const l = {
        value: Le(n),
        illegal: !1,
        relevance: 0,
        _top: a,
        _emitter: new i.__emitter(i)
      };
      return l._emitter.addText(n), l;
    }
    function Ie(n, l) {
      l = l || i.languages || Object.keys(t);
      const y = Ce(n), M = l.filter(V).filter(Qe).map(
        (P) => fe(P, n, !1)
      );
      M.unshift(y);
      const D = M.sort((P, J) => {
        if (P.relevance !== J.relevance) return J.relevance - P.relevance;
        if (P.language && J.language) {
          if (V(P.language).supersetOf === J.language)
            return 1;
          if (V(J.language).supersetOf === P.language)
            return -1;
        }
        return 0;
      }), [U, Y] = D, Oe = U;
      return Oe.secondBest = Y, Oe;
    }
    function Ut(n, l, y) {
      const M = l && r[l] || y;
      n.classList.add("hljs"), n.classList.add(`language-${M}`);
    }
    function De(n) {
      let l = null;
      const y = B(n);
      if (g(y)) return;
      if (me(
        "before:highlightElement",
        { el: n, language: y }
      ), n.dataset.highlighted) {
        console.log("Element previously highlighted. To highlight again, first unset `dataset.highlighted`.", n);
        return;
      }
      if (n.children.length > 0 && (i.ignoreUnescapedHTML || (console.warn("One of your code blocks includes unescaped HTML. This is a potentially serious security risk."), console.warn("https://github.com/highlightjs/highlight.js/wiki/security"), console.warn("The element with unescaped HTML:"), console.warn(n)), i.throwUnescapedHTML))
        throw new Ft(
          "One of your code blocks includes unescaped HTML.",
          n.innerHTML
        );
      l = n;
      const M = l.textContent, D = y ? C(M, { language: y, ignoreIllegals: !0 }) : Ie(M);
      n.innerHTML = D.value, n.dataset.highlighted = "yes", Ut(n, y, D.language), n.result = {
        language: D.language,
        // TODO: remove with version 11.0
        re: D.relevance,
        relevance: D.relevance
      }, D.secondBest && (n.secondBest = {
        language: D.secondBest.language,
        relevance: D.secondBest.relevance
      }), me("after:highlightElement", { el: n, result: D, text: M });
    }
    function Jt(n) {
      i = Ke(i, n);
    }
    const zt = () => {
      Re(), oe("10.6.0", "initHighlighting() deprecated.  Use highlightAll() now.");
    };
    function Gt() {
      Re(), oe("10.6.0", "initHighlightingOnLoad() deprecated.  Use highlightAll() now.");
    }
    let Ye = !1;
    function Re() {
      function n() {
        Re();
      }
      if (document.readyState === "loading") {
        Ye || window.addEventListener("DOMContentLoaded", n, !1), Ye = !0;
        return;
      }
      document.querySelectorAll(i.cssSelector).forEach(De);
    }
    function Wt(n, l) {
      let y = null;
      try {
        y = l(e);
      } catch (M) {
        if (Q("Language definition for '{}' could not be registered.".replace("{}", n)), T)
          Q(M);
        else
          throw M;
        y = a;
      }
      y.name || (y.name = n), t[n] = y, y.rawDefinition = l.bind(null, e), y.aliases && Ze(y.aliases, { languageName: n });
    }
    function Kt(n) {
      delete t[n];
      for (const l of Object.keys(r))
        r[l] === n && delete r[l];
    }
    function Xt() {
      return Object.keys(t);
    }
    function V(n) {
      return n = (n || "").toLowerCase(), t[n] || t[r[n]];
    }
    function Ze(n, { languageName: l }) {
      typeof n == "string" && (n = [n]), n.forEach((y) => {
        r[y.toLowerCase()] = l;
      });
    }
    function Qe(n) {
      const l = V(n);
      return l && !l.disableAutodetect;
    }
    function Vt(n) {
      n["before:highlightBlock"] && !n["before:highlightElement"] && (n["before:highlightElement"] = (l) => {
        n["before:highlightBlock"](
          Object.assign({ block: l.el }, l)
        );
      }), n["after:highlightBlock"] && !n["after:highlightElement"] && (n["after:highlightElement"] = (l) => {
        n["after:highlightBlock"](
          Object.assign({ block: l.el }, l)
        );
      });
    }
    function Yt(n) {
      Vt(n), f.push(n);
    }
    function Zt(n) {
      const l = f.indexOf(n);
      l !== -1 && f.splice(l, 1);
    }
    function me(n, l) {
      const y = n;
      f.forEach(function(M) {
        M[y] && M[y](l);
      });
    }
    function Qt(n) {
      return oe("10.7.0", "highlightBlock will be removed entirely in v12.0"), oe("10.7.0", "Please use highlightElement now."), De(n);
    }
    Object.assign(e, {
      highlight: C,
      highlightAuto: Ie,
      highlightAll: Re,
      highlightElement: De,
      // TODO: Remove with v12 API
      highlightBlock: Qt,
      configure: Jt,
      initHighlighting: zt,
      initHighlightingOnLoad: Gt,
      registerLanguage: Wt,
      unregisterLanguage: Kt,
      listLanguages: Xt,
      getLanguage: V,
      registerAliases: Ze,
      autoDetection: Qe,
      inherit: Ke,
      addPlugin: Yt,
      removePlugin: Zt
    }), e.debugMode = function() {
      T = !1;
    }, e.safeMode = function() {
      T = !0;
    }, e.versionString = Pt, e.regex = {
      concat: m,
      lookahead: E,
      either: $,
      optional: j,
      anyNumberOfTimes: k
    };
    for (const n in _e)
      typeof _e[n] == "object" && o(_e[n]);
    return Object.assign(e, _e), e;
  }, ae = Ve({});
  return ae.newInstance = () => Ve({}), $e = ae, ae.HighlightJS = ae, ae.default = ae, $e;
}
var dn = /* @__PURE__ */ ln();
const ct = /* @__PURE__ */ cn(dn);
function un(o) {
  const u = {
    className: "attr",
    begin: /"(\\.|[^\\"\r\n])*"(?=\s*:)/,
    relevance: 1.01
  }, d = {
    match: /[{}[\],:]/,
    className: "punctuation",
    relevance: 0
  }, S = [
    "true",
    "false",
    "null"
  ], O = {
    scope: "literal",
    beginKeywords: S.join(" ")
  };
  return {
    name: "JSON",
    aliases: ["jsonc"],
    keywords: {
      literal: S
    },
    contains: [
      u,
      d,
      o.QUOTE_STRING_MODE,
      O,
      o.C_NUMBER_MODE,
      o.C_LINE_COMMENT_MODE,
      o.C_BLOCK_COMMENT_MODE
    ],
    illegal: "\\S"
  };
}
ct.registerLanguage("json", un);
let te = null, ne = null, he = null, Te = null, re = null, Pe, Ae = null, Fe = !1;
const ot = "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
async function je(o, u, d) {
  const S = o.checked, O = `ssrf-scanner.${S ? "enable" : "disable"}${u.charAt(0).toUpperCase() + u.slice(1)}`;
  try {
    await d.backend[O](), v(`${u} module ${S ? "enabled" : "disabled"}`, "info");
  } catch (I) {
    v(`Failed to ${S ? "enable" : "disable"} ${u} module: ${I}`, "error"), o.checked = !S;
  }
}
function v(o, u = "info") {
  if (!he) return;
  const d = (/* @__PURE__ */ new Date()).toLocaleTimeString();
  he.value += `[${d}] [${u.toUpperCase()}] ${o}
`, he.scrollTop = he.scrollHeight;
}
function lt(o) {
  const u = /(https?:\/\/[^\s"']+)/g;
  return o.replace(u, (d) => `<span class="highlighted-url">${d}</span>`);
}
function Z(o, u = !1) {
  if (!o) return "";
  try {
    const d = ct.highlight(o, { language: "json" }).value;
    return u ? lt(d) : d;
  } catch {
    return pe(o, u);
  }
}
function pe(o, u = !1) {
  const d = o.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return u ? lt(d) : d;
}
function gn(o, u) {
  if (!te) return;
  te.innerHTML = "";
  const d = document.createElement("h2");
  d.textContent = "Settings";
  const S = document.createElement("p");
  S.textContent = "Configure the SSRF Scanner plugin modules.", te.appendChild(d), te.appendChild(S);
  const O = document.createElement("form");
  O.className = "settings-form";
  const I = (k, j) => {
    const m = document.createElement("div");
    m.className = "setting-row";
    const K = document.createElement("label");
    K.htmlFor = k, K.textContent = j;
    const $ = document.createElement("input");
    return $.type = "checkbox", $.id = k, $.className = "checkbox-input", $.checked = o[`${k.split("-")[0]}Enabled`] || !1, m.appendChild(K), m.appendChild($), O.appendChild(m), [K, $];
  }, [W, F] = I("discovery-toggle", "Enable Discovery Module:"), [w, L] = I("probe-toggle", "Enable Probe Module:"), [_, b] = I("debug-logging-checkbox", "Enable Debug Logging (UI & Backend):");
  F.addEventListener("change", (k) => je(k.target, "discovery", u)), L.addEventListener("change", (k) => je(k.target, "probe", u)), b.addEventListener("change", (k) => je(k.target, "debugLogging", u)), te.appendChild(O);
  const E = document.createElement("button");
  E.textContent = "Process Sample Request", E.className = "refresh-button", te.appendChild(E), E.addEventListener("click", async () => {
    v("Frontend: Starting sample request processing...", "info");
    try {
      const k = {
        url: "http://bsdgfds.iownthisdomainname.net/test",
        method: "POST",
        headers: {
          "User-Agent": "Caido-SSRF-Tester",
          Accept: "text/html",
          "Content-Type": "application/json"
        },
        body: '{"URL": "https://bb.iownthisdomainname.net/test12354"}'
      };
      v("Frontend: Sending request data: " + JSON.stringify(k, null, 2), "info");
      const j = await u.backend["ssrf-scanner.processRequest"](k);
      if (v("Frontend: Received raw response: " + j, "info"), typeof j != "string")
        throw new Error(`Expected string response but got ${typeof j}`);
      const m = JSON.parse(j);
      v("Frontend: Parsed response: " + JSON.stringify(m, null, 2), "info"), m.success ? (m.finding ? v(`Frontend: New finding created with ID: ${m.finding.id} Host: ${m.finding.host} Path: ${m.finding.path}`, "info") : v(`Frontend: ${m.message || "Request processed successfully"}`, "info"), re ? (v("Frontend: Refreshing findings view...", "info"), await re(), v("Frontend: Findings view refreshed", "info")) : v("Frontend: Warning - refresh function not available", "error")) : v(`Frontend: Error: ${m.error || "Unknown error"}`, "error");
    } catch (k) {
      v(`Frontend: Error processing sample request: ${k.message || JSON.stringify(k)}`, "error"), v("Frontend: Error stack: " + (k.stack || "No stack trace available"), "error");
    }
  }), v("Settings initialized with:", "info"), v(`- Discovery Module: ${o.discoveryEnabled ? "Enabled" : "Disabled"}`, "info"), v(`- Probe Module: ${o.probeEnabled ? "Enabled" : "Disabled"}`, "info"), v(`- Debug Logging: ${o.debugLoggingEnabled ? "Enabled" : "Disabled"}`, "info");
}
function fn(o) {
  var F;
  if (!ne) return;
  ne.innerHTML = "";
  const u = document.createElement("div");
  u.className = "findings-header", u.innerHTML = `
        <h2>Findings</h2>
        <div class="refresh-controls">
            <div class="auto-refresh-toggle">
                <label for="auto-refresh">Auto-refresh:</label>
                <input type="checkbox" id="auto-refresh" class="toggle-switch" ${Fe ? "checked" : ""}>
            </div>
            <button class="refresh-button">Refresh Findings</button>
        </div>
    `, ne.appendChild(u), (F = u.querySelector(".refresh-button")) == null || F.addEventListener("click", () => {
    re && re();
  });
  const d = u.querySelector("#auto-refresh");
  if (d == null || d.addEventListener("change", (w) => {
    Fe = w.target.checked, Fe ? (Ae = window.setInterval(() => {
      re && re();
    }, 5e3), v("Auto-refresh enabled", "info")) : (Ae && (clearInterval(Ae), Ae = null), v("Auto-refresh disabled", "info"));
  }), o.length === 0) {
    const w = document.createElement("p");
    w.textContent = "No findings yet. Discovered endpoints will appear here.", ne.appendChild(w);
    return;
  }
  const S = document.createElement("table");
  S.className = "findings-table";
  const I = S.createTHead().insertRow();
  ["Date/Time", "Host", "Path", "Method", "Status", "Actions"].forEach((w) => {
    const L = document.createElement("th");
    L.textContent = w, I.appendChild(L);
  });
  const W = S.createTBody();
  o.sort((w, L) => new Date(L.timestamp).getTime() - new Date(w.timestamp).getTime()).forEach((w) => {
    const L = W.insertRow();
    L.className = "finding-row", L.setAttribute("data-finding-id", w.id);
    let _ = "-", b = "", E = w.probeStatus || "not_probed";
    switch (v(`Frontend UI: Rendering finding ${w.id} with probeStatus: ${E}`, "info"), E) {
      case "probed":
        _ = "✔", b = `Probed @ ${new Date(w.probeTimestamp || 0).toLocaleString()}`;
        break;
      case "error":
        _ = "✖", b = `Error @ ${new Date(w.probeTimestamp || 0).toLocaleString()}: ${w.probeError}`;
        break;
      case "disabled":
        _ = "➖", b = `Probing disabled when found. Timestamp: ${new Date(w.probeTimestamp || w.timestamp).toLocaleString()}`;
        break;
      case "pending":
        _ = "⏳", b = "Pending";
        break;
      case "not_probed":
      default:
        _ = "-", b = "Not Probed";
        break;
    }
    L.innerHTML = `
                <td>${new Date(w.timestamp).toLocaleString()}</td>
                <td>${w.host}</td>
                <td>${w.path}</td>
                <td>${w.method}</td>
                <td>
                    <span class="status-badge ${E}" title="${b}">
                        ${_}
                    </span>
                </td>
                <td>
                    <button class="view-details-btn" data-finding-id="${w.id}">
                        View Details
                    </button>
                </td>
            `;
  }), ne.appendChild(S), ne.querySelectorAll(".view-details-btn").forEach((w) => {
    w.addEventListener("click", (L) => {
      var K, $, ce, Ee, ye, se, we, le, ie, de;
      const _ = L.target.getAttribute("data-finding-id"), b = o.find((N) => N.id === _);
      if (!b) return;
      const E = document.createElement("div");
      E.className = "details-modal", E.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Request Details</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="tabs">
                            <button class="tab-button active" data-tab="original">Original Request</button>
                            <button class="tab-button" data-tab="probe">Probe Request</button>
                        </div>
                        <div class="tab-content active" id="original-tab">
                            <div class="request-section">
                                <h4>Original Request</h4>
                                <div class="editor-container">
                                    <div class="editor-header">
                                        <span>Headers</span>
                                    </div>
                                    <pre class="request-headers selectable-text" id="original-request-headers"></pre>
                                    <div class="editor-header">
                                        <span>Body</span>
                                    </div>
                                    <pre class="request-body selectable-text" id="original-request-body"></pre>
                                </div>
                            </div>
                            <div class="response-section">
                                <h4>Original Response</h4>
                                <div class="editor-container">
                                    <div class="editor-header">
                                        <span>Status: ${((K = b.originalResponse) == null ? void 0 : K.status) || "N/A"}</span>
                                    </div>
                                    <div class="editor-header">
                                        <span>Headers</span>
                                    </div>
                                    <pre class="response-headers selectable-text" id="original-response-headers"></pre>
                                    <div class="editor-header">
                                        <span>Body</span>
                                    </div>
                                    <pre class="response-body selectable-text" id="original-response-body"></pre>
                                </div>
                            </div>
                        </div>
                        <div class="tab-content" id="probe-tab">
                            <div class="request-section">
                                <h4>Probe Request</h4>
                                <div class="editor-container">
                                    <div class="editor-header">
                                        <span>Headers</span>
                                    </div>
                                    <pre class="request-headers selectable-text" id="probe-request-headers"></pre>
                                    <div class="editor-header">
                                        <span>Body</span>
                                    </div>
                                    <pre class="request-body selectable-text" id="probe-request-body"></pre>
                                </div>
                            </div>
                            ${b.probeResponse ? `
                            <div class="response-section">
                                <h4>Probe Response</h4>
                                <div class="editor-container">
                                    <div class="editor-header">
                                        <span>Status: ${b.probeResponse.status}</span>
                                    </div>
                                    <div class="editor-header">
                                        <span>Headers</span>
                                    </div>
                                    <pre class="response-headers selectable-text" id="probe-response-headers"></pre>
                                    <div class="editor-header">
                                        <span>Body</span>
                                    </div>
                                    <pre class="response-body selectable-text" id="probe-response-body"></pre>
                                </div>
                            </div>
                            ` : ""}
                        </div>
                    </div>
                </div>`;
      const k = E.querySelector(".close-modal");
      k && k.addEventListener("click", () => {
        E.remove();
      });
      const j = E.querySelectorAll(".tab-button"), m = E.querySelectorAll(".tab-content");
      j.forEach((N) => {
        N.addEventListener("click", () => {
          var ve;
          j.forEach((ue) => ue.classList.remove("active")), m.forEach((ue) => ue.classList.remove("active")), N.classList.add("active");
          const Se = N.getAttribute("data-tab");
          (ve = E.querySelector(`#${Se}-tab`)) == null || ve.classList.add("active");
        });
      }), E.addEventListener("click", (N) => {
        N.target === E && E.remove();
      }), document.body.appendChild(E), E.querySelector("#original-request-headers").innerHTML = Z(JSON.stringify((($ = b.originalRequest) == null ? void 0 : $.headers) || {}, null, 2), !1);
      try {
        const N = JSON.parse(((ce = b.originalRequest) == null ? void 0 : ce.body) || "");
        E.querySelector("#original-request-body").innerHTML = Z(JSON.stringify(N, null, 2), !0);
      } catch {
        E.querySelector("#original-request-body").innerHTML = pe(((Ee = b.originalRequest) == null ? void 0 : Ee.body) || "", !0);
      }
      E.querySelector("#original-response-headers").innerHTML = Z(JSON.stringify(((ye = b.originalResponse) == null ? void 0 : ye.headers) || {}, null, 2), !1);
      try {
        const N = JSON.parse(((se = b.originalResponse) == null ? void 0 : se.body) || "");
        E.querySelector("#original-response-body").innerHTML = Z(JSON.stringify(N, null, 2), !0);
      } catch {
        E.querySelector("#original-response-body").innerHTML = pe(((we = b.originalResponse) == null ? void 0 : we.body) || "", !0);
      }
      if (b.probeResponse) {
        E.querySelector("#probe-request-headers").innerHTML = Z(JSON.stringify(((le = b.probeRequest) == null ? void 0 : le.headers) || {}, null, 2), !1);
        try {
          const N = JSON.parse(((ie = b.probeRequest) == null ? void 0 : ie.body) || "");
          E.querySelector("#probe-request-body").innerHTML = Z(JSON.stringify(N, null, 2), !0);
        } catch {
          E.querySelector("#probe-request-body").innerHTML = pe(((de = b.probeRequest) == null ? void 0 : de.body) || "", !0);
        }
        E.querySelector("#probe-response-headers").innerHTML = Z(JSON.stringify(b.probeResponse.headers || {}, null, 2), !1);
        try {
          const N = JSON.parse(b.probeResponse.body || "");
          E.querySelector("#probe-response-body").innerHTML = Z(JSON.stringify(N, null, 2), !0);
        } catch {
          E.querySelector("#probe-response-body").innerHTML = pe(b.probeResponse.body || "", !0);
        }
      }
    });
  });
}
function hn(o) {
  Pe && cancelAnimationFrame(Pe);
  const u = o.getContext("2d");
  if (!u) return;
  o.width = o.offsetWidth, o.height = o.offsetHeight;
  const d = 16, S = Math.ceil(o.width / d), O = [];
  for (let _ = 0; _ < S; _++)
    O[_] = Math.random() * o.height / d;
  function I() {
    u.fillStyle = "rgba(0, 0, 0, 0.05)", u.fillRect(0, 0, o.width, o.height), u.fillStyle = "#00C853", u.font = d + 'px "Fira Code", monospace';
    for (let _ = 0; _ < O.length; _++) {
      const b = ot[Math.floor(Math.random() * ot.length)];
      u.fillText(b, _ * d, O[_] * d), O[_] * d > o.height && Math.random() > 0.975 && (O[_] = 0), O[_]++;
    }
  }
  let W = 0;
  const w = 1e3 / 15;
  function L(_) {
    Pe = requestAnimationFrame(L);
    const b = _ - W;
    b > w && (W = _ - b % w, I());
  }
  L(0);
}
function pn(o, u) {
  if (re = o, Te) return Te;
  const d = document.createElement("div");
  d.className = "ssrf-scanner-container", d.innerHTML = `
        <canvas id="matrix-canvas"></canvas>
        <div class="plugin-main-content">
            <div class="plugin-header"><h1>SSRF Scanner Plugin</h1></div>
            <div class="plugin-tabs">
                <button class="tab-button active" data-tab="settings">Settings</button>
                <button class="tab-button" data-tab="findings">Findings</button>
                <button class="tab-button" data-tab="logging">Logging</button>
            </div>
            <div class="plugin-content">
                <div id="settings-view" class="tab-content active"></div>
                <div id="findings-view" class="tab-content"></div>
                <div id="logging-view" class="tab-content">
                    <h2>Debug Log</h2>
                    <textarea id="debug-log-textarea" readonly></textarea>
                </div>
            </div>
        </div>`, te = d.querySelector("#settings-view"), ne = d.querySelector("#findings-view"), d.querySelector("#logging-view"), he = d.querySelector("#debug-log-textarea"), d.querySelectorAll(".tab-content").forEach((I) => {
    I.style.display = "none";
  }), d.querySelector("#settings-view").style.display = "block", d.querySelectorAll(".tab-button").forEach((I) => {
    I.addEventListener("click", () => {
      d.querySelectorAll(".tab-button").forEach((F) => F.classList.remove("active")), I.classList.add("active");
      const W = I.getAttribute("data-tab");
      d.querySelectorAll(".tab-content").forEach((F) => {
        const w = F;
        w.style.display = w.id === `${W}-view` ? "block" : "none";
      });
    });
  }), Te = d;
  const S = Te.querySelector("#matrix-canvas");
  S && new ResizeObserver(() => hn(S)).observe(d);
  const O = document.createElement("style");
  return O.textContent = `
        .findings-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }
        
        .findings-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
        }
        
        .findings-table th,
        .findings-table td {
            padding: 0.5rem;
            border: 1px solid #444;
            text-align: left;
        }
        
        .findings-table th {
            background-color: #2a2a2a;
        }
        
        .status-badge {
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.875rem;
        }
        
        .status-badge.probed {
            background-color: #00C853;
            color: white;
        }
        
        .status-badge.not_probed {
            background-color: #FF5252;
            color: white;
        }
        
        .status-badge.error {
            background-color: #FFD600;
            color: black;
        }
        
        .status-badge.pending {
            background-color: #FFA500;
            color: white;
        }
        
        .status-badge.disabled {
            background-color: #757575;
            color: white;
        }
        
        .view-details-btn {
            padding: 0.25rem 0.5rem;
            background-color: #2196F3;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        
        .view-details-btn:hover {
            background-color: #1976D2;
        }
        
        .details-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        
        .modal-content {
            background-color: #1e1e1e;
            border-radius: 8px;
            width: 80%;
            max-width: 1200px;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
            z-index: 1001;
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            border-bottom: 1px solid #444;
            background-color: #1e1e1e;
        }
        
        .close-modal {
            background: none;
            border: none;
            color: #fff;
            font-size: 1.5rem;
            cursor: pointer;
        }
        
        .modal-body {
            padding: 1rem;
            background-color: #1e1e1e;
        }
        
        .tabs {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1rem;
            border-bottom: 1px solid #444;
            padding-bottom: 0.5rem;
        }
        
        .tab-button {
            padding: 0.5rem 1rem;
            background: rgba(13, 2, 8, 0.85);
            border: none;
            color: #fff;
            cursor: pointer;
            border-radius: 4px;
        }
        
        .tab-button:hover {
            background-color: #333;
        }
        
        .tab-button.active {
            background-color: #2196F3;
        }
        
        .tab-content {
            display: none;
        }
        
        .tab-content.active {
            display: block;
        }
        
        .request-section,
        .response-section {
            margin-bottom: 2rem;
            background-color: #1e1e1e;
        }
        
        .editor-container {
            background-color: #2a2a2a;
            border-radius: 4px;
            margin-top: 0.5rem;
            border: 1px solid #444;
        }
        
        .editor-header {
            padding: 0.5rem;
            background-color: #333;
            border-bottom: 1px solid #444;
        }
        
        .request-headers,
        .request-body,
        .response-headers,
        .response-body {
            margin: 0;
            padding: 1rem;
            overflow-x: auto;
            white-space: pre-wrap;
            font-family: 'Fira Code', monospace;
            font-size: 0.875rem;
            background-color: #2a2a2a;
            color: #00ff00;
        }

        /* Styles for JSON highlighting */
        .json-key {
            color: #A0C0D0; /* Muted Cyan-Blue */
        }

        .json-string {
            color: #88BBAA; /* Soft Green */
        }

        .json-number,
        .json-boolean {
            color: #BB88CC; /* Muted Purple */
        }

        /* Ensure text is selectable */
        .selectable-text {
            user-select: text; /* Standard property */
            -webkit-user-select: text; /* Safari */
            -moz-user-select: text; /* Firefox */
            -ms-user-select: text; /* IE/Edge */
        }

        /* Base style for pre tags */
        pre {
            white-space: pre-wrap; /* Ensures long lines wrap */
            word-wrap: break-word; /* Ensures long words break */
        }

        .highlighted-url {
            background-color: rgba(255, 255, 0, 0.3);
            padding: 2px 4px;
            border-radius: 3px;
        }
    `, document.head.appendChild(O), d;
}
let G, be = !1;
async function at() {
  if (!(!G || !be))
    try {
      v("Refreshing findings data...", "info");
      const o = await G.backend["ssrf-scanner.getAllFindings"](), u = JSON.parse(o);
      fn(u), v("Findings data refreshed successfully", "info");
    } catch (o) {
      v(`Error refreshing findings: ${o.message || JSON.stringify(o)}`, "error");
    }
}
async function bn() {
  if (!(!G || !be))
    try {
      v("Refreshing settings data...", "info");
      const o = await G.backend["ssrf-scanner.getSettings"](), u = JSON.parse(o);
      gn(u, G), v("Settings data refreshed successfully", "info");
    } catch (o) {
      v(`Error refreshing settings: ${o.message || JSON.stringify(o)}`, "error");
    }
}
function yn(o) {
  if (be) {
    v("Plugin already initialized", "info");
    return;
  }
  try {
    G = o, be = !0;
    const u = "/ssrf-scanner", d = pn(at, G);
    G.sidebar.registerItem("SSRF Scanner", u, {
      icon: "fas fa-user-secret"
    }), G.navigation.addPage(u, {
      body: d
    }), G.backend.onEvent("ssrf-scanner.log", (S, O) => {
      v(S, O ? "error" : "info");
    }), bn(), at(), v("Plugin initialized successfully", "info");
  } catch (u) {
    v(`Error initializing plugin: ${u.message || JSON.stringify(u)}`, "error"), be = !1;
  }
}
export {
  yn as init
};
