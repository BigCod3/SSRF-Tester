var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/.pnpm/highlight.js@11.11.1/node_modules/highlight.js/lib/core.js
var require_core = __commonJS({
  "node_modules/.pnpm/highlight.js@11.11.1/node_modules/highlight.js/lib/core.js"(exports, module) {
    "use strict";
    function deepFreeze(obj) {
      if (obj instanceof Map) {
        obj.clear = obj.delete = obj.set = function() {
          throw new Error("map is read-only");
        };
      } else if (obj instanceof Set) {
        obj.add = obj.clear = obj.delete = function() {
          throw new Error("set is read-only");
        };
      }
      Object.freeze(obj);
      Object.getOwnPropertyNames(obj).forEach((name) => {
        const prop = obj[name];
        const type = typeof prop;
        if ((type === "object" || type === "function") && !Object.isFrozen(prop)) {
          deepFreeze(prop);
        }
      });
      return obj;
    }
    var Response = class {
      /**
       * @param {CompiledMode} mode
       */
      constructor(mode) {
        if (mode.data === void 0) mode.data = {};
        this.data = mode.data;
        this.isMatchIgnored = false;
      }
      ignoreMatch() {
        this.isMatchIgnored = true;
      }
    };
    function escapeHTML(value) {
      return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
    }
    function inherit$1(original, ...objects) {
      const result = /* @__PURE__ */ Object.create(null);
      for (const key in original) {
        result[key] = original[key];
      }
      objects.forEach(function(obj) {
        for (const key in obj) {
          result[key] = obj[key];
        }
      });
      return (
        /** @type {T} */
        result
      );
    }
    var SPAN_CLOSE = "</span>";
    var emitsWrappingTags = (node) => {
      return !!node.scope;
    };
    var scopeToCSSClass = (name, { prefix }) => {
      if (name.startsWith("language:")) {
        return name.replace("language:", "language-");
      }
      if (name.includes(".")) {
        const pieces = name.split(".");
        return [
          `${prefix}${pieces.shift()}`,
          ...pieces.map((x, i) => `${x}${"_".repeat(i + 1)}`)
        ].join(" ");
      }
      return `${prefix}${name}`;
    };
    var HTMLRenderer = class {
      /**
       * Creates a new HTMLRenderer
       *
       * @param {Tree} parseTree - the parse tree (must support `walk` API)
       * @param {{classPrefix: string}} options
       */
      constructor(parseTree, options) {
        this.buffer = "";
        this.classPrefix = options.classPrefix;
        parseTree.walk(this);
      }
      /**
       * Adds texts to the output stream
       *
       * @param {string} text */
      addText(text) {
        this.buffer += escapeHTML(text);
      }
      /**
       * Adds a node open to the output stream (if needed)
       *
       * @param {Node} node */
      openNode(node) {
        if (!emitsWrappingTags(node)) return;
        const className = scopeToCSSClass(
          node.scope,
          { prefix: this.classPrefix }
        );
        this.span(className);
      }
      /**
       * Adds a node close to the output stream (if needed)
       *
       * @param {Node} node */
      closeNode(node) {
        if (!emitsWrappingTags(node)) return;
        this.buffer += SPAN_CLOSE;
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
      span(className) {
        this.buffer += `<span class="${className}">`;
      }
    };
    var newNode = (opts = {}) => {
      const result = { children: [] };
      Object.assign(result, opts);
      return result;
    };
    var TokenTree = class _TokenTree {
      constructor() {
        this.rootNode = newNode();
        this.stack = [this.rootNode];
      }
      get top() {
        return this.stack[this.stack.length - 1];
      }
      get root() {
        return this.rootNode;
      }
      /** @param {Node} node */
      add(node) {
        this.top.children.push(node);
      }
      /** @param {string} scope */
      openNode(scope) {
        const node = newNode({ scope });
        this.add(node);
        this.stack.push(node);
      }
      closeNode() {
        if (this.stack.length > 1) {
          return this.stack.pop();
        }
        return void 0;
      }
      closeAllNodes() {
        while (this.closeNode()) ;
      }
      toJSON() {
        return JSON.stringify(this.rootNode, null, 4);
      }
      /**
       * @typedef { import("./html_renderer").Renderer } Renderer
       * @param {Renderer} builder
       */
      walk(builder) {
        return this.constructor._walk(builder, this.rootNode);
      }
      /**
       * @param {Renderer} builder
       * @param {Node} node
       */
      static _walk(builder, node) {
        if (typeof node === "string") {
          builder.addText(node);
        } else if (node.children) {
          builder.openNode(node);
          node.children.forEach((child) => this._walk(builder, child));
          builder.closeNode(node);
        }
        return builder;
      }
      /**
       * @param {Node} node
       */
      static _collapse(node) {
        if (typeof node === "string") return;
        if (!node.children) return;
        if (node.children.every((el) => typeof el === "string")) {
          node.children = [node.children.join("")];
        } else {
          node.children.forEach((child) => {
            _TokenTree._collapse(child);
          });
        }
      }
    };
    var TokenTreeEmitter = class extends TokenTree {
      /**
       * @param {*} options
       */
      constructor(options) {
        super();
        this.options = options;
      }
      /**
       * @param {string} text
       */
      addText(text) {
        if (text === "") {
          return;
        }
        this.add(text);
      }
      /** @param {string} scope */
      startScope(scope) {
        this.openNode(scope);
      }
      endScope() {
        this.closeNode();
      }
      /**
       * @param {Emitter & {root: DataNode}} emitter
       * @param {string} name
       */
      __addSublanguage(emitter, name) {
        const node = emitter.root;
        if (name) node.scope = `language:${name}`;
        this.add(node);
      }
      toHTML() {
        const renderer = new HTMLRenderer(this, this.options);
        return renderer.value();
      }
      finalize() {
        this.closeAllNodes();
        return true;
      }
    };
    function source(re) {
      if (!re) return null;
      if (typeof re === "string") return re;
      return re.source;
    }
    function lookahead(re) {
      return concat("(?=", re, ")");
    }
    function anyNumberOfTimes(re) {
      return concat("(?:", re, ")*");
    }
    function optional(re) {
      return concat("(?:", re, ")?");
    }
    function concat(...args) {
      const joined = args.map((x) => source(x)).join("");
      return joined;
    }
    function stripOptionsFromArgs(args) {
      const opts = args[args.length - 1];
      if (typeof opts === "object" && opts.constructor === Object) {
        args.splice(args.length - 1, 1);
        return opts;
      } else {
        return {};
      }
    }
    function either(...args) {
      const opts = stripOptionsFromArgs(args);
      const joined = "(" + (opts.capture ? "" : "?:") + args.map((x) => source(x)).join("|") + ")";
      return joined;
    }
    function countMatchGroups(re) {
      return new RegExp(re.toString() + "|").exec("").length - 1;
    }
    function startsWith(re, lexeme) {
      const match = re && re.exec(lexeme);
      return match && match.index === 0;
    }
    var BACKREF_RE = /\[(?:[^\\\]]|\\.)*\]|\(\??|\\([1-9][0-9]*)|\\./;
    function _rewriteBackreferences(regexps, { joinWith }) {
      let numCaptures = 0;
      return regexps.map((regex) => {
        numCaptures += 1;
        const offset = numCaptures;
        let re = source(regex);
        let out = "";
        while (re.length > 0) {
          const match = BACKREF_RE.exec(re);
          if (!match) {
            out += re;
            break;
          }
          out += re.substring(0, match.index);
          re = re.substring(match.index + match[0].length);
          if (match[0][0] === "\\" && match[1]) {
            out += "\\" + String(Number(match[1]) + offset);
          } else {
            out += match[0];
            if (match[0] === "(") {
              numCaptures++;
            }
          }
        }
        return out;
      }).map((re) => `(${re})`).join(joinWith);
    }
    var MATCH_NOTHING_RE = /\b\B/;
    var IDENT_RE = "[a-zA-Z]\\w*";
    var UNDERSCORE_IDENT_RE = "[a-zA-Z_]\\w*";
    var NUMBER_RE = "\\b\\d+(\\.\\d+)?";
    var C_NUMBER_RE = "(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)";
    var BINARY_NUMBER_RE = "\\b(0b[01]+)";
    var RE_STARTERS_RE = "!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~";
    var SHEBANG = (opts = {}) => {
      const beginShebang = /^#![ ]*\//;
      if (opts.binary) {
        opts.begin = concat(
          beginShebang,
          /.*\b/,
          opts.binary,
          /\b.*/
        );
      }
      return inherit$1({
        scope: "meta",
        begin: beginShebang,
        end: /$/,
        relevance: 0,
        /** @type {ModeCallback} */
        "on:begin": (m, resp) => {
          if (m.index !== 0) resp.ignoreMatch();
        }
      }, opts);
    };
    var BACKSLASH_ESCAPE = {
      begin: "\\\\[\\s\\S]",
      relevance: 0
    };
    var APOS_STRING_MODE = {
      scope: "string",
      begin: "'",
      end: "'",
      illegal: "\\n",
      contains: [BACKSLASH_ESCAPE]
    };
    var QUOTE_STRING_MODE = {
      scope: "string",
      begin: '"',
      end: '"',
      illegal: "\\n",
      contains: [BACKSLASH_ESCAPE]
    };
    var PHRASAL_WORDS_MODE = {
      begin: /\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/
    };
    var COMMENT = function(begin, end, modeOptions = {}) {
      const mode = inherit$1(
        {
          scope: "comment",
          begin,
          end,
          contains: []
        },
        modeOptions
      );
      mode.contains.push({
        scope: "doctag",
        // hack to avoid the space from being included. the space is necessary to
        // match here to prevent the plain text rule below from gobbling up doctags
        begin: "[ ]*(?=(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):)",
        end: /(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):/,
        excludeBegin: true,
        relevance: 0
      });
      const ENGLISH_WORD = either(
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
      mode.contains.push(
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
          begin: concat(
            /[ ]+/,
            // necessary to prevent us gobbling up doctags like /* @author Bob Mcgill */
            "(",
            ENGLISH_WORD,
            /[.]?[:]?([.][ ]|[ ])/,
            "){3}"
          )
          // look for 3 words in a row
        }
      );
      return mode;
    };
    var C_LINE_COMMENT_MODE = COMMENT("//", "$");
    var C_BLOCK_COMMENT_MODE = COMMENT("/\\*", "\\*/");
    var HASH_COMMENT_MODE = COMMENT("#", "$");
    var NUMBER_MODE = {
      scope: "number",
      begin: NUMBER_RE,
      relevance: 0
    };
    var C_NUMBER_MODE = {
      scope: "number",
      begin: C_NUMBER_RE,
      relevance: 0
    };
    var BINARY_NUMBER_MODE = {
      scope: "number",
      begin: BINARY_NUMBER_RE,
      relevance: 0
    };
    var REGEXP_MODE = {
      scope: "regexp",
      begin: /\/(?=[^/\n]*\/)/,
      end: /\/[gimuy]*/,
      contains: [
        BACKSLASH_ESCAPE,
        {
          begin: /\[/,
          end: /\]/,
          relevance: 0,
          contains: [BACKSLASH_ESCAPE]
        }
      ]
    };
    var TITLE_MODE = {
      scope: "title",
      begin: IDENT_RE,
      relevance: 0
    };
    var UNDERSCORE_TITLE_MODE = {
      scope: "title",
      begin: UNDERSCORE_IDENT_RE,
      relevance: 0
    };
    var METHOD_GUARD = {
      // excludes method names from keyword processing
      begin: "\\.\\s*" + UNDERSCORE_IDENT_RE,
      relevance: 0
    };
    var END_SAME_AS_BEGIN = function(mode) {
      return Object.assign(
        mode,
        {
          /** @type {ModeCallback} */
          "on:begin": (m, resp) => {
            resp.data._beginMatch = m[1];
          },
          /** @type {ModeCallback} */
          "on:end": (m, resp) => {
            if (resp.data._beginMatch !== m[1]) resp.ignoreMatch();
          }
        }
      );
    };
    var MODES = /* @__PURE__ */ Object.freeze({
      __proto__: null,
      APOS_STRING_MODE,
      BACKSLASH_ESCAPE,
      BINARY_NUMBER_MODE,
      BINARY_NUMBER_RE,
      COMMENT,
      C_BLOCK_COMMENT_MODE,
      C_LINE_COMMENT_MODE,
      C_NUMBER_MODE,
      C_NUMBER_RE,
      END_SAME_AS_BEGIN,
      HASH_COMMENT_MODE,
      IDENT_RE,
      MATCH_NOTHING_RE,
      METHOD_GUARD,
      NUMBER_MODE,
      NUMBER_RE,
      PHRASAL_WORDS_MODE,
      QUOTE_STRING_MODE,
      REGEXP_MODE,
      RE_STARTERS_RE,
      SHEBANG,
      TITLE_MODE,
      UNDERSCORE_IDENT_RE,
      UNDERSCORE_TITLE_MODE
    });
    function skipIfHasPrecedingDot(match, response) {
      const before = match.input[match.index - 1];
      if (before === ".") {
        response.ignoreMatch();
      }
    }
    function scopeClassName(mode, _parent) {
      if (mode.className !== void 0) {
        mode.scope = mode.className;
        delete mode.className;
      }
    }
    function beginKeywords(mode, parent) {
      if (!parent) return;
      if (!mode.beginKeywords) return;
      mode.begin = "\\b(" + mode.beginKeywords.split(" ").join("|") + ")(?!\\.)(?=\\b|\\s)";
      mode.__beforeBegin = skipIfHasPrecedingDot;
      mode.keywords = mode.keywords || mode.beginKeywords;
      delete mode.beginKeywords;
      if (mode.relevance === void 0) mode.relevance = 0;
    }
    function compileIllegal(mode, _parent) {
      if (!Array.isArray(mode.illegal)) return;
      mode.illegal = either(...mode.illegal);
    }
    function compileMatch(mode, _parent) {
      if (!mode.match) return;
      if (mode.begin || mode.end) throw new Error("begin & end are not supported with match");
      mode.begin = mode.match;
      delete mode.match;
    }
    function compileRelevance(mode, _parent) {
      if (mode.relevance === void 0) mode.relevance = 1;
    }
    var beforeMatchExt = (mode, parent) => {
      if (!mode.beforeMatch) return;
      if (mode.starts) throw new Error("beforeMatch cannot be used with starts");
      const originalMode = Object.assign({}, mode);
      Object.keys(mode).forEach((key) => {
        delete mode[key];
      });
      mode.keywords = originalMode.keywords;
      mode.begin = concat(originalMode.beforeMatch, lookahead(originalMode.begin));
      mode.starts = {
        relevance: 0,
        contains: [
          Object.assign(originalMode, { endsParent: true })
        ]
      };
      mode.relevance = 0;
      delete originalMode.beforeMatch;
    };
    var COMMON_KEYWORDS = [
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
    ];
    var DEFAULT_KEYWORD_SCOPE = "keyword";
    function compileKeywords(rawKeywords, caseInsensitive, scopeName = DEFAULT_KEYWORD_SCOPE) {
      const compiledKeywords = /* @__PURE__ */ Object.create(null);
      if (typeof rawKeywords === "string") {
        compileList(scopeName, rawKeywords.split(" "));
      } else if (Array.isArray(rawKeywords)) {
        compileList(scopeName, rawKeywords);
      } else {
        Object.keys(rawKeywords).forEach(function(scopeName2) {
          Object.assign(
            compiledKeywords,
            compileKeywords(rawKeywords[scopeName2], caseInsensitive, scopeName2)
          );
        });
      }
      return compiledKeywords;
      function compileList(scopeName2, keywordList) {
        if (caseInsensitive) {
          keywordList = keywordList.map((x) => x.toLowerCase());
        }
        keywordList.forEach(function(keyword) {
          const pair = keyword.split("|");
          compiledKeywords[pair[0]] = [scopeName2, scoreForKeyword(pair[0], pair[1])];
        });
      }
    }
    function scoreForKeyword(keyword, providedScore) {
      if (providedScore) {
        return Number(providedScore);
      }
      return commonKeyword(keyword) ? 0 : 1;
    }
    function commonKeyword(keyword) {
      return COMMON_KEYWORDS.includes(keyword.toLowerCase());
    }
    var seenDeprecations = {};
    var error = (message) => {
      console.error(message);
    };
    var warn = (message, ...args) => {
      console.log(`WARN: ${message}`, ...args);
    };
    var deprecated = (version2, message) => {
      if (seenDeprecations[`${version2}/${message}`]) return;
      console.log(`Deprecated as of ${version2}. ${message}`);
      seenDeprecations[`${version2}/${message}`] = true;
    };
    var MultiClassError = new Error();
    function remapScopeNames(mode, regexes, { key }) {
      let offset = 0;
      const scopeNames = mode[key];
      const emit = {};
      const positions = {};
      for (let i = 1; i <= regexes.length; i++) {
        positions[i + offset] = scopeNames[i];
        emit[i + offset] = true;
        offset += countMatchGroups(regexes[i - 1]);
      }
      mode[key] = positions;
      mode[key]._emit = emit;
      mode[key]._multi = true;
    }
    function beginMultiClass(mode) {
      if (!Array.isArray(mode.begin)) return;
      if (mode.skip || mode.excludeBegin || mode.returnBegin) {
        error("skip, excludeBegin, returnBegin not compatible with beginScope: {}");
        throw MultiClassError;
      }
      if (typeof mode.beginScope !== "object" || mode.beginScope === null) {
        error("beginScope must be object");
        throw MultiClassError;
      }
      remapScopeNames(mode, mode.begin, { key: "beginScope" });
      mode.begin = _rewriteBackreferences(mode.begin, { joinWith: "" });
    }
    function endMultiClass(mode) {
      if (!Array.isArray(mode.end)) return;
      if (mode.skip || mode.excludeEnd || mode.returnEnd) {
        error("skip, excludeEnd, returnEnd not compatible with endScope: {}");
        throw MultiClassError;
      }
      if (typeof mode.endScope !== "object" || mode.endScope === null) {
        error("endScope must be object");
        throw MultiClassError;
      }
      remapScopeNames(mode, mode.end, { key: "endScope" });
      mode.end = _rewriteBackreferences(mode.end, { joinWith: "" });
    }
    function scopeSugar(mode) {
      if (mode.scope && typeof mode.scope === "object" && mode.scope !== null) {
        mode.beginScope = mode.scope;
        delete mode.scope;
      }
    }
    function MultiClass(mode) {
      scopeSugar(mode);
      if (typeof mode.beginScope === "string") {
        mode.beginScope = { _wrap: mode.beginScope };
      }
      if (typeof mode.endScope === "string") {
        mode.endScope = { _wrap: mode.endScope };
      }
      beginMultiClass(mode);
      endMultiClass(mode);
    }
    function compileLanguage(language) {
      function langRe(value, global) {
        return new RegExp(
          source(value),
          "m" + (language.case_insensitive ? "i" : "") + (language.unicodeRegex ? "u" : "") + (global ? "g" : "")
        );
      }
      class MultiRegex {
        constructor() {
          this.matchIndexes = {};
          this.regexes = [];
          this.matchAt = 1;
          this.position = 0;
        }
        // @ts-ignore
        addRule(re, opts) {
          opts.position = this.position++;
          this.matchIndexes[this.matchAt] = opts;
          this.regexes.push([opts, re]);
          this.matchAt += countMatchGroups(re) + 1;
        }
        compile() {
          if (this.regexes.length === 0) {
            this.exec = () => null;
          }
          const terminators = this.regexes.map((el) => el[1]);
          this.matcherRe = langRe(_rewriteBackreferences(terminators, { joinWith: "|" }), true);
          this.lastIndex = 0;
        }
        /** @param {string} s */
        exec(s) {
          this.matcherRe.lastIndex = this.lastIndex;
          const match = this.matcherRe.exec(s);
          if (!match) {
            return null;
          }
          const i = match.findIndex((el, i2) => i2 > 0 && el !== void 0);
          const matchData = this.matchIndexes[i];
          match.splice(0, i);
          return Object.assign(match, matchData);
        }
      }
      class ResumableMultiRegex {
        constructor() {
          this.rules = [];
          this.multiRegexes = [];
          this.count = 0;
          this.lastIndex = 0;
          this.regexIndex = 0;
        }
        // @ts-ignore
        getMatcher(index) {
          if (this.multiRegexes[index]) return this.multiRegexes[index];
          const matcher = new MultiRegex();
          this.rules.slice(index).forEach(([re, opts]) => matcher.addRule(re, opts));
          matcher.compile();
          this.multiRegexes[index] = matcher;
          return matcher;
        }
        resumingScanAtSamePosition() {
          return this.regexIndex !== 0;
        }
        considerAll() {
          this.regexIndex = 0;
        }
        // @ts-ignore
        addRule(re, opts) {
          this.rules.push([re, opts]);
          if (opts.type === "begin") this.count++;
        }
        /** @param {string} s */
        exec(s) {
          const m = this.getMatcher(this.regexIndex);
          m.lastIndex = this.lastIndex;
          let result = m.exec(s);
          if (this.resumingScanAtSamePosition()) {
            if (result && result.index === this.lastIndex) ;
            else {
              const m2 = this.getMatcher(0);
              m2.lastIndex = this.lastIndex + 1;
              result = m2.exec(s);
            }
          }
          if (result) {
            this.regexIndex += result.position + 1;
            if (this.regexIndex === this.count) {
              this.considerAll();
            }
          }
          return result;
        }
      }
      function buildModeRegex(mode) {
        const mm = new ResumableMultiRegex();
        mode.contains.forEach((term) => mm.addRule(term.begin, { rule: term, type: "begin" }));
        if (mode.terminatorEnd) {
          mm.addRule(mode.terminatorEnd, { type: "end" });
        }
        if (mode.illegal) {
          mm.addRule(mode.illegal, { type: "illegal" });
        }
        return mm;
      }
      function compileMode(mode, parent) {
        const cmode = (
          /** @type CompiledMode */
          mode
        );
        if (mode.isCompiled) return cmode;
        [
          scopeClassName,
          // do this early so compiler extensions generally don't have to worry about
          // the distinction between match/begin
          compileMatch,
          MultiClass,
          beforeMatchExt
        ].forEach((ext) => ext(mode, parent));
        language.compilerExtensions.forEach((ext) => ext(mode, parent));
        mode.__beforeBegin = null;
        [
          beginKeywords,
          // do this later so compiler extensions that come earlier have access to the
          // raw array if they wanted to perhaps manipulate it, etc.
          compileIllegal,
          // default to 1 relevance if not specified
          compileRelevance
        ].forEach((ext) => ext(mode, parent));
        mode.isCompiled = true;
        let keywordPattern = null;
        if (typeof mode.keywords === "object" && mode.keywords.$pattern) {
          mode.keywords = Object.assign({}, mode.keywords);
          keywordPattern = mode.keywords.$pattern;
          delete mode.keywords.$pattern;
        }
        keywordPattern = keywordPattern || /\w+/;
        if (mode.keywords) {
          mode.keywords = compileKeywords(mode.keywords, language.case_insensitive);
        }
        cmode.keywordPatternRe = langRe(keywordPattern, true);
        if (parent) {
          if (!mode.begin) mode.begin = /\B|\b/;
          cmode.beginRe = langRe(cmode.begin);
          if (!mode.end && !mode.endsWithParent) mode.end = /\B|\b/;
          if (mode.end) cmode.endRe = langRe(cmode.end);
          cmode.terminatorEnd = source(cmode.end) || "";
          if (mode.endsWithParent && parent.terminatorEnd) {
            cmode.terminatorEnd += (mode.end ? "|" : "") + parent.terminatorEnd;
          }
        }
        if (mode.illegal) cmode.illegalRe = langRe(
          /** @type {RegExp | string} */
          mode.illegal
        );
        if (!mode.contains) mode.contains = [];
        mode.contains = [].concat(...mode.contains.map(function(c) {
          return expandOrCloneMode(c === "self" ? mode : c);
        }));
        mode.contains.forEach(function(c) {
          compileMode(
            /** @type Mode */
            c,
            cmode
          );
        });
        if (mode.starts) {
          compileMode(mode.starts, parent);
        }
        cmode.matcher = buildModeRegex(cmode);
        return cmode;
      }
      if (!language.compilerExtensions) language.compilerExtensions = [];
      if (language.contains && language.contains.includes("self")) {
        throw new Error("ERR: contains `self` is not supported at the top-level of a language.  See documentation.");
      }
      language.classNameAliases = inherit$1(language.classNameAliases || {});
      return compileMode(
        /** @type Mode */
        language
      );
    }
    function dependencyOnParent(mode) {
      if (!mode) return false;
      return mode.endsWithParent || dependencyOnParent(mode.starts);
    }
    function expandOrCloneMode(mode) {
      if (mode.variants && !mode.cachedVariants) {
        mode.cachedVariants = mode.variants.map(function(variant) {
          return inherit$1(mode, { variants: null }, variant);
        });
      }
      if (mode.cachedVariants) {
        return mode.cachedVariants;
      }
      if (dependencyOnParent(mode)) {
        return inherit$1(mode, { starts: mode.starts ? inherit$1(mode.starts) : null });
      }
      if (Object.isFrozen(mode)) {
        return inherit$1(mode);
      }
      return mode;
    }
    var version = "11.11.1";
    var HTMLInjectionError = class extends Error {
      constructor(reason, html) {
        super(reason);
        this.name = "HTMLInjectionError";
        this.html = html;
      }
    };
    var escape = escapeHTML;
    var inherit = inherit$1;
    var NO_MATCH = Symbol("nomatch");
    var MAX_KEYWORD_HITS = 7;
    var HLJS = function(hljs) {
      const languages = /* @__PURE__ */ Object.create(null);
      const aliases = /* @__PURE__ */ Object.create(null);
      const plugins = [];
      let SAFE_MODE = true;
      const LANGUAGE_NOT_FOUND = "Could not find the language '{}', did you forget to load/include a language module?";
      const PLAINTEXT_LANGUAGE = { disableAutodetect: true, name: "Plain text", contains: [] };
      let options = {
        ignoreUnescapedHTML: false,
        throwUnescapedHTML: false,
        noHighlightRe: /^(no-?highlight)$/i,
        languageDetectRe: /\blang(?:uage)?-([\w-]+)\b/i,
        classPrefix: "hljs-",
        cssSelector: "pre code",
        languages: null,
        // beta configuration options, subject to change, welcome to discuss
        // https://github.com/highlightjs/highlight.js/issues/1086
        __emitter: TokenTreeEmitter
      };
      function shouldNotHighlight(languageName) {
        return options.noHighlightRe.test(languageName);
      }
      function blockLanguage(block) {
        let classes = block.className + " ";
        classes += block.parentNode ? block.parentNode.className : "";
        const match = options.languageDetectRe.exec(classes);
        if (match) {
          const language = getLanguage(match[1]);
          if (!language) {
            warn(LANGUAGE_NOT_FOUND.replace("{}", match[1]));
            warn("Falling back to no-highlight mode for this block.", block);
          }
          return language ? match[1] : "no-highlight";
        }
        return classes.split(/\s+/).find((_class) => shouldNotHighlight(_class) || getLanguage(_class));
      }
      function highlight2(codeOrLanguageName, optionsOrCode, ignoreIllegals) {
        let code = "";
        let languageName = "";
        if (typeof optionsOrCode === "object") {
          code = codeOrLanguageName;
          ignoreIllegals = optionsOrCode.ignoreIllegals;
          languageName = optionsOrCode.language;
        } else {
          deprecated("10.7.0", "highlight(lang, code, ...args) has been deprecated.");
          deprecated("10.7.0", "Please use highlight(code, options) instead.\nhttps://github.com/highlightjs/highlight.js/issues/2277");
          languageName = codeOrLanguageName;
          code = optionsOrCode;
        }
        if (ignoreIllegals === void 0) {
          ignoreIllegals = true;
        }
        const context = {
          code,
          language: languageName
        };
        fire("before:highlight", context);
        const result = context.result ? context.result : _highlight(context.language, context.code, ignoreIllegals);
        result.code = context.code;
        fire("after:highlight", result);
        return result;
      }
      function _highlight(languageName, codeToHighlight, ignoreIllegals, continuation) {
        const keywordHits = /* @__PURE__ */ Object.create(null);
        function keywordData(mode, matchText) {
          return mode.keywords[matchText];
        }
        function processKeywords() {
          if (!top.keywords) {
            emitter.addText(modeBuffer);
            return;
          }
          let lastIndex = 0;
          top.keywordPatternRe.lastIndex = 0;
          let match = top.keywordPatternRe.exec(modeBuffer);
          let buf = "";
          while (match) {
            buf += modeBuffer.substring(lastIndex, match.index);
            const word = language.case_insensitive ? match[0].toLowerCase() : match[0];
            const data = keywordData(top, word);
            if (data) {
              const [kind, keywordRelevance] = data;
              emitter.addText(buf);
              buf = "";
              keywordHits[word] = (keywordHits[word] || 0) + 1;
              if (keywordHits[word] <= MAX_KEYWORD_HITS) relevance += keywordRelevance;
              if (kind.startsWith("_")) {
                buf += match[0];
              } else {
                const cssClass = language.classNameAliases[kind] || kind;
                emitKeyword(match[0], cssClass);
              }
            } else {
              buf += match[0];
            }
            lastIndex = top.keywordPatternRe.lastIndex;
            match = top.keywordPatternRe.exec(modeBuffer);
          }
          buf += modeBuffer.substring(lastIndex);
          emitter.addText(buf);
        }
        function processSubLanguage() {
          if (modeBuffer === "") return;
          let result2 = null;
          if (typeof top.subLanguage === "string") {
            if (!languages[top.subLanguage]) {
              emitter.addText(modeBuffer);
              return;
            }
            result2 = _highlight(top.subLanguage, modeBuffer, true, continuations[top.subLanguage]);
            continuations[top.subLanguage] = /** @type {CompiledMode} */
            result2._top;
          } else {
            result2 = highlightAuto(modeBuffer, top.subLanguage.length ? top.subLanguage : null);
          }
          if (top.relevance > 0) {
            relevance += result2.relevance;
          }
          emitter.__addSublanguage(result2._emitter, result2.language);
        }
        function processBuffer() {
          if (top.subLanguage != null) {
            processSubLanguage();
          } else {
            processKeywords();
          }
          modeBuffer = "";
        }
        function emitKeyword(keyword, scope) {
          if (keyword === "") return;
          emitter.startScope(scope);
          emitter.addText(keyword);
          emitter.endScope();
        }
        function emitMultiClass(scope, match) {
          let i = 1;
          const max = match.length - 1;
          while (i <= max) {
            if (!scope._emit[i]) {
              i++;
              continue;
            }
            const klass = language.classNameAliases[scope[i]] || scope[i];
            const text = match[i];
            if (klass) {
              emitKeyword(text, klass);
            } else {
              modeBuffer = text;
              processKeywords();
              modeBuffer = "";
            }
            i++;
          }
        }
        function startNewMode(mode, match) {
          if (mode.scope && typeof mode.scope === "string") {
            emitter.openNode(language.classNameAliases[mode.scope] || mode.scope);
          }
          if (mode.beginScope) {
            if (mode.beginScope._wrap) {
              emitKeyword(modeBuffer, language.classNameAliases[mode.beginScope._wrap] || mode.beginScope._wrap);
              modeBuffer = "";
            } else if (mode.beginScope._multi) {
              emitMultiClass(mode.beginScope, match);
              modeBuffer = "";
            }
          }
          top = Object.create(mode, { parent: { value: top } });
          return top;
        }
        function endOfMode(mode, match, matchPlusRemainder) {
          let matched = startsWith(mode.endRe, matchPlusRemainder);
          if (matched) {
            if (mode["on:end"]) {
              const resp = new Response(mode);
              mode["on:end"](match, resp);
              if (resp.isMatchIgnored) matched = false;
            }
            if (matched) {
              while (mode.endsParent && mode.parent) {
                mode = mode.parent;
              }
              return mode;
            }
          }
          if (mode.endsWithParent) {
            return endOfMode(mode.parent, match, matchPlusRemainder);
          }
        }
        function doIgnore(lexeme) {
          if (top.matcher.regexIndex === 0) {
            modeBuffer += lexeme[0];
            return 1;
          } else {
            resumeScanAtSamePosition = true;
            return 0;
          }
        }
        function doBeginMatch(match) {
          const lexeme = match[0];
          const newMode = match.rule;
          const resp = new Response(newMode);
          const beforeCallbacks = [newMode.__beforeBegin, newMode["on:begin"]];
          for (const cb of beforeCallbacks) {
            if (!cb) continue;
            cb(match, resp);
            if (resp.isMatchIgnored) return doIgnore(lexeme);
          }
          if (newMode.skip) {
            modeBuffer += lexeme;
          } else {
            if (newMode.excludeBegin) {
              modeBuffer += lexeme;
            }
            processBuffer();
            if (!newMode.returnBegin && !newMode.excludeBegin) {
              modeBuffer = lexeme;
            }
          }
          startNewMode(newMode, match);
          return newMode.returnBegin ? 0 : lexeme.length;
        }
        function doEndMatch(match) {
          const lexeme = match[0];
          const matchPlusRemainder = codeToHighlight.substring(match.index);
          const endMode = endOfMode(top, match, matchPlusRemainder);
          if (!endMode) {
            return NO_MATCH;
          }
          const origin = top;
          if (top.endScope && top.endScope._wrap) {
            processBuffer();
            emitKeyword(lexeme, top.endScope._wrap);
          } else if (top.endScope && top.endScope._multi) {
            processBuffer();
            emitMultiClass(top.endScope, match);
          } else if (origin.skip) {
            modeBuffer += lexeme;
          } else {
            if (!(origin.returnEnd || origin.excludeEnd)) {
              modeBuffer += lexeme;
            }
            processBuffer();
            if (origin.excludeEnd) {
              modeBuffer = lexeme;
            }
          }
          do {
            if (top.scope) {
              emitter.closeNode();
            }
            if (!top.skip && !top.subLanguage) {
              relevance += top.relevance;
            }
            top = top.parent;
          } while (top !== endMode.parent);
          if (endMode.starts) {
            startNewMode(endMode.starts, match);
          }
          return origin.returnEnd ? 0 : lexeme.length;
        }
        function processContinuations() {
          const list = [];
          for (let current = top; current !== language; current = current.parent) {
            if (current.scope) {
              list.unshift(current.scope);
            }
          }
          list.forEach((item) => emitter.openNode(item));
        }
        let lastMatch = {};
        function processLexeme(textBeforeMatch, match) {
          const lexeme = match && match[0];
          modeBuffer += textBeforeMatch;
          if (lexeme == null) {
            processBuffer();
            return 0;
          }
          if (lastMatch.type === "begin" && match.type === "end" && lastMatch.index === match.index && lexeme === "") {
            modeBuffer += codeToHighlight.slice(match.index, match.index + 1);
            if (!SAFE_MODE) {
              const err = new Error(`0 width match regex (${languageName})`);
              err.languageName = languageName;
              err.badRule = lastMatch.rule;
              throw err;
            }
            return 1;
          }
          lastMatch = match;
          if (match.type === "begin") {
            return doBeginMatch(match);
          } else if (match.type === "illegal" && !ignoreIllegals) {
            const err = new Error('Illegal lexeme "' + lexeme + '" for mode "' + (top.scope || "<unnamed>") + '"');
            err.mode = top;
            throw err;
          } else if (match.type === "end") {
            const processed = doEndMatch(match);
            if (processed !== NO_MATCH) {
              return processed;
            }
          }
          if (match.type === "illegal" && lexeme === "") {
            modeBuffer += "\n";
            return 1;
          }
          if (iterations > 1e5 && iterations > match.index * 3) {
            const err = new Error("potential infinite loop, way more iterations than matches");
            throw err;
          }
          modeBuffer += lexeme;
          return lexeme.length;
        }
        const language = getLanguage(languageName);
        if (!language) {
          error(LANGUAGE_NOT_FOUND.replace("{}", languageName));
          throw new Error('Unknown language: "' + languageName + '"');
        }
        const md = compileLanguage(language);
        let result = "";
        let top = continuation || md;
        const continuations = {};
        const emitter = new options.__emitter(options);
        processContinuations();
        let modeBuffer = "";
        let relevance = 0;
        let index = 0;
        let iterations = 0;
        let resumeScanAtSamePosition = false;
        try {
          if (!language.__emitTokens) {
            top.matcher.considerAll();
            for (; ; ) {
              iterations++;
              if (resumeScanAtSamePosition) {
                resumeScanAtSamePosition = false;
              } else {
                top.matcher.considerAll();
              }
              top.matcher.lastIndex = index;
              const match = top.matcher.exec(codeToHighlight);
              if (!match) break;
              const beforeMatch = codeToHighlight.substring(index, match.index);
              const processedCount = processLexeme(beforeMatch, match);
              index = match.index + processedCount;
            }
            processLexeme(codeToHighlight.substring(index));
          } else {
            language.__emitTokens(codeToHighlight, emitter);
          }
          emitter.finalize();
          result = emitter.toHTML();
          return {
            language: languageName,
            value: result,
            relevance,
            illegal: false,
            _emitter: emitter,
            _top: top
          };
        } catch (err) {
          if (err.message && err.message.includes("Illegal")) {
            return {
              language: languageName,
              value: escape(codeToHighlight),
              illegal: true,
              relevance: 0,
              _illegalBy: {
                message: err.message,
                index,
                context: codeToHighlight.slice(index - 100, index + 100),
                mode: err.mode,
                resultSoFar: result
              },
              _emitter: emitter
            };
          } else if (SAFE_MODE) {
            return {
              language: languageName,
              value: escape(codeToHighlight),
              illegal: false,
              relevance: 0,
              errorRaised: err,
              _emitter: emitter,
              _top: top
            };
          } else {
            throw err;
          }
        }
      }
      function justTextHighlightResult(code) {
        const result = {
          value: escape(code),
          illegal: false,
          relevance: 0,
          _top: PLAINTEXT_LANGUAGE,
          _emitter: new options.__emitter(options)
        };
        result._emitter.addText(code);
        return result;
      }
      function highlightAuto(code, languageSubset) {
        languageSubset = languageSubset || options.languages || Object.keys(languages);
        const plaintext = justTextHighlightResult(code);
        const results = languageSubset.filter(getLanguage).filter(autoDetection).map(
          (name) => _highlight(name, code, false)
        );
        results.unshift(plaintext);
        const sorted = results.sort((a, b) => {
          if (a.relevance !== b.relevance) return b.relevance - a.relevance;
          if (a.language && b.language) {
            if (getLanguage(a.language).supersetOf === b.language) {
              return 1;
            } else if (getLanguage(b.language).supersetOf === a.language) {
              return -1;
            }
          }
          return 0;
        });
        const [best, secondBest] = sorted;
        const result = best;
        result.secondBest = secondBest;
        return result;
      }
      function updateClassName(element, currentLang, resultLang) {
        const language = currentLang && aliases[currentLang] || resultLang;
        element.classList.add("hljs");
        element.classList.add(`language-${language}`);
      }
      function highlightElement(element) {
        let node = null;
        const language = blockLanguage(element);
        if (shouldNotHighlight(language)) return;
        fire(
          "before:highlightElement",
          { el: element, language }
        );
        if (element.dataset.highlighted) {
          console.log("Element previously highlighted. To highlight again, first unset `dataset.highlighted`.", element);
          return;
        }
        if (element.children.length > 0) {
          if (!options.ignoreUnescapedHTML) {
            console.warn("One of your code blocks includes unescaped HTML. This is a potentially serious security risk.");
            console.warn("https://github.com/highlightjs/highlight.js/wiki/security");
            console.warn("The element with unescaped HTML:");
            console.warn(element);
          }
          if (options.throwUnescapedHTML) {
            const err = new HTMLInjectionError(
              "One of your code blocks includes unescaped HTML.",
              element.innerHTML
            );
            throw err;
          }
        }
        node = element;
        const text = node.textContent;
        const result = language ? highlight2(text, { language, ignoreIllegals: true }) : highlightAuto(text);
        element.innerHTML = result.value;
        element.dataset.highlighted = "yes";
        updateClassName(element, language, result.language);
        element.result = {
          language: result.language,
          // TODO: remove with version 11.0
          re: result.relevance,
          relevance: result.relevance
        };
        if (result.secondBest) {
          element.secondBest = {
            language: result.secondBest.language,
            relevance: result.secondBest.relevance
          };
        }
        fire("after:highlightElement", { el: element, result, text });
      }
      function configure(userOptions) {
        options = inherit(options, userOptions);
      }
      const initHighlighting = () => {
        highlightAll();
        deprecated("10.6.0", "initHighlighting() deprecated.  Use highlightAll() now.");
      };
      function initHighlightingOnLoad() {
        highlightAll();
        deprecated("10.6.0", "initHighlightingOnLoad() deprecated.  Use highlightAll() now.");
      }
      let wantsHighlight = false;
      function highlightAll() {
        function boot() {
          highlightAll();
        }
        if (document.readyState === "loading") {
          if (!wantsHighlight) {
            window.addEventListener("DOMContentLoaded", boot, false);
          }
          wantsHighlight = true;
          return;
        }
        const blocks = document.querySelectorAll(options.cssSelector);
        blocks.forEach(highlightElement);
      }
      function registerLanguage(languageName, languageDefinition) {
        let lang = null;
        try {
          lang = languageDefinition(hljs);
        } catch (error$1) {
          error("Language definition for '{}' could not be registered.".replace("{}", languageName));
          if (!SAFE_MODE) {
            throw error$1;
          } else {
            error(error$1);
          }
          lang = PLAINTEXT_LANGUAGE;
        }
        if (!lang.name) lang.name = languageName;
        languages[languageName] = lang;
        lang.rawDefinition = languageDefinition.bind(null, hljs);
        if (lang.aliases) {
          registerAliases(lang.aliases, { languageName });
        }
      }
      function unregisterLanguage(languageName) {
        delete languages[languageName];
        for (const alias of Object.keys(aliases)) {
          if (aliases[alias] === languageName) {
            delete aliases[alias];
          }
        }
      }
      function listLanguages() {
        return Object.keys(languages);
      }
      function getLanguage(name) {
        name = (name || "").toLowerCase();
        return languages[name] || languages[aliases[name]];
      }
      function registerAliases(aliasList, { languageName }) {
        if (typeof aliasList === "string") {
          aliasList = [aliasList];
        }
        aliasList.forEach((alias) => {
          aliases[alias.toLowerCase()] = languageName;
        });
      }
      function autoDetection(name) {
        const lang = getLanguage(name);
        return lang && !lang.disableAutodetect;
      }
      function upgradePluginAPI(plugin) {
        if (plugin["before:highlightBlock"] && !plugin["before:highlightElement"]) {
          plugin["before:highlightElement"] = (data) => {
            plugin["before:highlightBlock"](
              Object.assign({ block: data.el }, data)
            );
          };
        }
        if (plugin["after:highlightBlock"] && !plugin["after:highlightElement"]) {
          plugin["after:highlightElement"] = (data) => {
            plugin["after:highlightBlock"](
              Object.assign({ block: data.el }, data)
            );
          };
        }
      }
      function addPlugin(plugin) {
        upgradePluginAPI(plugin);
        plugins.push(plugin);
      }
      function removePlugin(plugin) {
        const index = plugins.indexOf(plugin);
        if (index !== -1) {
          plugins.splice(index, 1);
        }
      }
      function fire(event, args) {
        const cb = event;
        plugins.forEach(function(plugin) {
          if (plugin[cb]) {
            plugin[cb](args);
          }
        });
      }
      function deprecateHighlightBlock(el) {
        deprecated("10.7.0", "highlightBlock will be removed entirely in v12.0");
        deprecated("10.7.0", "Please use highlightElement now.");
        return highlightElement(el);
      }
      Object.assign(hljs, {
        highlight: highlight2,
        highlightAuto,
        highlightAll,
        highlightElement,
        // TODO: Remove with v12 API
        highlightBlock: deprecateHighlightBlock,
        configure,
        initHighlighting,
        initHighlightingOnLoad,
        registerLanguage,
        unregisterLanguage,
        listLanguages,
        getLanguage,
        registerAliases,
        autoDetection,
        inherit,
        addPlugin,
        removePlugin
      });
      hljs.debugMode = function() {
        SAFE_MODE = false;
      };
      hljs.safeMode = function() {
        SAFE_MODE = true;
      };
      hljs.versionString = version;
      hljs.regex = {
        concat,
        lookahead,
        either,
        optional,
        anyNumberOfTimes
      };
      for (const key in MODES) {
        if (typeof MODES[key] === "object") {
          deepFreeze(MODES[key]);
        }
      }
      Object.assign(hljs, MODES);
      return hljs;
    };
    var highlight = HLJS({});
    highlight.newInstance = () => HLJS({});
    module.exports = highlight;
    highlight.HighlightJS = highlight;
    highlight.default = highlight;
  }
});

// packages/backend/src/utils.ts
function getJsonKeys(json2, keys = /* @__PURE__ */ new Set()) {
  if (typeof json2 === "object" && json2 !== null) {
    if (Array.isArray(json2)) {
      json2.forEach((item) => getJsonKeys(item, keys));
    } else {
      Object.keys(json2).forEach((key) => {
        keys.add(key);
        getJsonKeys(json2[key], keys);
      });
    }
  }
  return keys;
}
function normalizeRequestBodyWithRegex(requestBody) {
  if (!requestBody) return "empty-body";
  let normalizedBody = requestBody;
  normalizedBody = normalizedBody.replace(
    /(?:https?|ftp|file|ws|wss):\/\/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g,
    "__URL__"
  );
  normalizedBody = normalizedBody.replace(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
    "__RANDOM_ID__"
  );
  normalizedBody = normalizedBody.replace(
    /\b[0-9a-f]{20,}\b/gi,
    "__RANDOM_ID__"
  );
  normalizedBody = normalizedBody.replace(
    /\b\d{10,}\b/g,
    "__RANDOM_NUM__"
  );
  normalizedBody = normalizedBody.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    "__EMAIL__"
  );
  normalizedBody = normalizedBody.replace(
    /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    "__IP__"
  );
  if (normalizedBody.replace(/__URL__|__RANDOM_ID__|__RANDOM_NUM__|__EMAIL__|__IP__|\s/g, "").length < 10) {
    return "short-normalized-content";
  }
  return normalizedBody;
}
function generateBodySignature(requestBody, rawContentType) {
  const contentType = rawContentType?.toLowerCase().split(";")[0];
  if (!requestBody) {
    return "empty-body";
  }
  let signature = "";
  const trimmedBody = String(requestBody).trim();
  if (!trimmedBody) {
    return "empty-body";
  }
  if (contentType === "application/json" || !contentType && (trimmedBody.startsWith("{") || trimmedBody.startsWith("["))) {
    try {
      const jsonData = JSON.parse(trimmedBody);
      const keys = Array.from(getJsonKeys(jsonData)).sort();
      if (keys.length > 0) {
        signature = `json-keys:${keys.join(",")}`;
      } else {
        signature = "json-empty";
      }
    } catch (e) {
      signature = "fallback:json-parsing-failed";
    }
  } else if (contentType === "application/x-www-form-urlencoded") {
    try {
      const params = new URLSearchParams(trimmedBody);
      const keys = Array.from(params.keys()).sort();
      if (keys.length > 0) {
        signature = `form-keys:${keys.join(",")}`;
      } else {
        signature = "form-empty";
      }
    } catch (e) {
      signature = "fallback:form-parsing-failed";
    }
  } else if (contentType === "multipart/form-data") {
    const names = /* @__PURE__ */ new Set();
    const nameRegex = /Content-Disposition:(?:.*;)?\s*name="([^"]+)"/gi;
    let match;
    while ((match = nameRegex.exec(trimmedBody)) !== null) {
      names.add(match[1]);
    }
    if (names.size > 0) {
      signature = `multipart-names:${Array.from(names).sort().join(",")}`;
    } else {
      signature = "fallback:multipart-no-names-found";
    }
  } else {
    signature = "fallback:unknown-content-type";
  }
  if (signature.startsWith("fallback:") || signature === "json-empty" || signature === "form-empty" || signature === "fallback:multipart-no-names-found" || signature === "fallback:unknown-content-type") {
    const normalizedBody = normalizeRequestBodyWithRegex(trimmedBody);
    if (normalizedBody === "empty-body" || normalizedBody === "short-normalized-content") {
      return normalizedBody;
    }
    return `regex-normalized:${normalizedBody}`;
  }
  return signature;
}
function getDeduplicationKey(host, path, bodySignature) {
  const safeHost = host || "no-host";
  const safePath = path || "no-path";
  const safeBodySignature = bodySignature || "no-signature";
  return `${safeHost}|${safePath}|${safeBodySignature}`;
}
function extractUrlsFromRequestBody(requestBody, _contentType) {
  if (!requestBody) {
    return [];
  }
  const foundUrls = /* @__PURE__ */ new Set();
  const urlRegex = /(?:https?|ftp|file|ws|wss):\/\/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
  let match;
  while ((match = urlRegex.exec(requestBody)) !== null) {
    const url = match[0];
    try {
      new URL(url);
      foundUrls.add(url);
    } catch (e) {
      continue;
    }
  }
  return Array.from(foundUrls);
}

// packages/backend/src/discovery.ts
var DiscoveryModule = class {
  discoveredEndpoints;
  _isEnabled;
  sdk;
  processedRequestsCount;
  findingsCount;
  constructor(sdk) {
    this.discoveredEndpoints = /* @__PURE__ */ new Map();
    this._isEnabled = false;
    this.sdk = sdk;
    this.processedRequestsCount = 0;
    this.findingsCount = 0;
  }
  get isEnabled() {
    return this._isEnabled;
  }
  set isEnabled(value) {
    this._isEnabled = value;
    this.sdk.console.log(`Discovery module ${value ? "enabled" : "disabled"}`);
  }
  async processRequest(request) {
    if (!this._isEnabled) return null;
    try {
      const body = await request.text();
      const headers = Object.fromEntries(request.headers.entries());
      const contentType = headers["content-type"];
      const bodySignature = generateBodySignature(body, contentType);
      const deduplicationKey = getDeduplicationKey(request.method, request.host, request.path, bodySignature);
      const containedUrls = extractUrlsFromRequestBody(body);
      if (containedUrls.length === 0) {
        this.sdk.console.log(`No URLs found in body for ${request.method} ${request.host}${request.path}, skipping finding creation.`);
        return null;
      }
      if (this.discoveredEndpoints.has(deduplicationKey)) {
        this.sdk.console.log(`Endpoint already discovered: ${request.method} ${request.host}${request.path}`);
        return null;
      }
      let initialProbeStatus = "disabled";
      try {
        const settings = await this.sdk.api.call("ssrf-scanner.getSettings");
        const parsedSettings = JSON.parse(settings);
        initialProbeStatus = parsedSettings.probeEnabled ? "pending" : "disabled";
      } catch (error) {
        this.sdk.console.error("Error getting probe module status:", error);
      }
      const endpoint = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        host: request.host,
        path: request.path,
        method: request.method,
        originalRequest: {
          body,
          headers,
          contentType
        },
        originalResponse: {
          status: 0,
          headers: {},
          body: ""
        },
        bodySignature,
        deduplicationKey,
        containedUrls,
        probeStatus: initialProbeStatus,
        probeTimestamp: initialProbeStatus === "disabled" ? (/* @__PURE__ */ new Date()).toISOString() : void 0
      };
      this.discoveredEndpoints.set(deduplicationKey, endpoint);
      this.sdk.console.log(`New endpoint discovered: ${request.method} ${request.host}${request.path} with probe status: ${initialProbeStatus}`);
      this.sdk.api.call("ssrf-scanner.updateFinding", endpoint);
      return endpoint;
    } catch (error) {
      this.sdk.console.error("Error processing request:", error);
      return null;
    }
  }
  updateProbeStatus(deduplicationKey, probeResponse) {
    const endpoint = this.discoveredEndpoints.get(deduplicationKey);
    if (!endpoint) return;
    try {
      endpoint.probeStatus = "probed";
      endpoint.probeTimestamp = (/* @__PURE__ */ new Date()).toISOString();
      endpoint.probeResponse = probeResponse;
      this.sdk.console.log(`Updated probe status for ${endpoint.method} ${endpoint.host}${endpoint.path}`);
    } catch (error) {
      this.sdk.console.error(`Error updating probe status: ${error}`);
      endpoint.probeStatus = "error";
      endpoint.probeError = `Failed to update probe status: ${error}`;
    }
  }
  getAllFindings() {
    return Array.from(this.discoveredEndpoints.values());
  }
  getFindingById(id) {
    return Array.from(this.discoveredEndpoints.values()).find((endpoint) => endpoint.id === id);
  }
  getStats() {
    return {
      processedRequests: this.processedRequestsCount,
      findingsCount: this.findingsCount
    };
  }
  getFindingByRequest(request) {
    const host = request.getHost();
    const path = request.getPath();
    const method = request.getMethod();
    const body = request.getBody();
    const bodySignature = generateBodySignature(body);
    const deduplicationKey = getDeduplicationKey(method, host, path, bodySignature);
    return this.discoveredEndpoints.get(deduplicationKey);
  }
  updateFinding(finding) {
    const existingFinding = this.discoveredEndpoints.get(finding.deduplicationKey);
    if (existingFinding) {
      existingFinding.probeStatus = finding.probeStatus;
      existingFinding.probeTimestamp = finding.probeTimestamp;
      existingFinding.probeRequest = finding.probeRequest;
      existingFinding.probeResponse = finding.probeResponse;
      existingFinding.probeError = finding.probeError;
      this.sdk.console.log(`Updated finding for ${finding.method} ${finding.host}${finding.path} with probe status: ${finding.probeStatus}`);
      this.sdk.api.call("ssrf-scanner.updateFinding", existingFinding);
    }
  }
};

// packages/backend/src/probe.ts
import { Request, fetch, Headers } from "caido:http";
var ProbeModule = class {
  _isEnabled;
  sdk;
  callbackUrl;
  constructor(sdk) {
    this._isEnabled = false;
    this.sdk = sdk;
    this.callbackUrl = "https://request-spy.iownthisdomainname.net";
  }
  get isEnabled() {
    return this._isEnabled;
  }
  set isEnabled(value) {
    this._isEnabled = value;
    this.sdk.console.log(`Probe module ${value ? "enabled" : "disabled"}`);
  }
  setCallbackUrl(url) {
    this.callbackUrl = url;
    this.sdk.console.log(`Callback URL set to: ${url}`);
  }
  async createProbeRequestBody(request) {
    try {
      const body = await request.text();
      const contentType = request.headers.get("content-type") || "";
      const urls = extractUrlsFromRequestBody(body, contentType);
      if (urls.length === 0) {
        this.sdk.console.log("No URLs found in request body");
        return null;
      }
      let probeBody = body;
      urls.forEach((url) => {
        probeBody = probeBody.replace(url, this.callbackUrl);
      });
      return probeBody;
    } catch (error) {
      this.sdk.console.error(`Error creating probe request body: ${error}`);
      return null;
    }
  }
  async createProbeRequest(request) {
    try {
      const originalUrl = new URL(request.url);
      const originalHost = originalUrl.host;
      const originalPath = originalUrl.pathname;
      const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
      const callbackPath = `/${originalHost}${originalPath}/${timestamp}`;
      const callbackUrl = new URL(callbackPath, this.callbackUrl);
      this.sdk.console.log("Probe: Created callback URL:", callbackUrl.toString());
      const probeRequest = new Request(callbackUrl, {
        method: request.method,
        headers: new Headers(request.headers),
        body: request.body
      });
      return probeRequest;
    } catch (error) {
      this.sdk.console.error("Error creating probe request:", error);
      return null;
    }
  }
  async sendProbe(request) {
    if (!this._isEnabled) {
      this.sdk.console.log("Probe module is disabled, skipping probe");
      return null;
    }
    try {
      this.sdk.console.log("Probe: Starting probe request...");
      const originalBody = await request.text();
      const urlsInBody = extractUrlsFromRequestBody(originalBody);
      if (urlsInBody.length === 0) {
        this.sdk.console.log("Probe: No URLs found in request body, skipping probe");
        return null;
      }
      let probeBody = originalBody;
      const targetUrlInBody = new URL(urlsInBody[0]);
      const originalHost = request.host;
      const originalPath = targetUrlInBody.pathname;
      const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
      const uniquePath = `/${originalHost}${originalPath}/${timestamp}`;
      const newProbeUrl = new URL(uniquePath, this.callbackUrl);
      this.sdk.console.log("Probe: Replacing body URL with:", newProbeUrl.toString());
      probeBody = originalBody.replace(urlsInBody[0], newProbeUrl.toString());
      const probeRequest = new Request(request.url.toString(), {
        method: request.method,
        headers: new Headers(request.headers),
        body: probeBody
      });
      const contentLengthHeader = probeRequest.headers.get("content-length");
      if (contentLengthHeader) {
        probeRequest.headers.set("content-length", Buffer.byteLength(probeBody).toString());
      }
      const probeRequestDetails = {
        url: probeRequest.url.toString(),
        method: probeRequest.method,
        headers: Object.fromEntries(probeRequest.headers.entries()),
        body: probeBody
      };
      this.sdk.console.log("Probe: Sending probe request:", probeRequestDetails);
      const response = await fetch(probeRequest);
      this.sdk.console.log("Probe: Received probe response:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      const responseBody = await response.text();
      this.sdk.console.log("Probe: Successfully completed probe request");
      return {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseBody,
        probeRequest: probeRequestDetails,
        probeStatus: "probed"
      };
    } catch (error) {
      this.sdk.console.error("Error sending probe:", error);
      return {
        status: 0,
        headers: {},
        body: "",
        probeRequest: {
          url: request.url.toString(),
          method: request.method,
          headers: Object.fromEntries(request.headers.entries()),
          body: await request.text()
        },
        probeStatus: "error"
      };
    }
  }
  getStats() {
    return { probesSent: 0 };
  }
};

// node_modules/.pnpm/highlight.js@11.11.1/node_modules/highlight.js/es/core.js
var import_core = __toESM(require_core(), 1);
var core_default = import_core.default;

// node_modules/.pnpm/highlight.js@11.11.1/node_modules/highlight.js/es/languages/json.js
function json(hljs) {
  const ATTRIBUTE = {
    className: "attr",
    begin: /"(\\.|[^\\"\r\n])*"(?=\s*:)/,
    relevance: 1.01
  };
  const PUNCTUATION = {
    match: /[{}[\],:]/,
    className: "punctuation",
    relevance: 0
  };
  const LITERALS = [
    "true",
    "false",
    "null"
  ];
  const LITERALS_MODE = {
    scope: "literal",
    beginKeywords: LITERALS.join(" ")
  };
  return {
    name: "JSON",
    aliases: ["jsonc"],
    keywords: {
      literal: LITERALS
    },
    contains: [
      ATTRIBUTE,
      PUNCTUATION,
      hljs.QUOTE_STRING_MODE,
      LITERALS_MODE,
      hljs.C_NUMBER_MODE,
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE
    ],
    illegal: "\\S"
  };
}

// packages/frontend/src/ui.ts
core_default.registerLanguage("json", json);
var MATRIX_CHARS = "\u30A2\u30A1\u30AB\u30B5\u30BF\u30CA\u30CF\u30DE\u30E4\u30E3\u30E9\u30EF\u30AC\u30B6\u30C0\u30D0\u30D1\u30A4\u30A3\u30AD\u30B7\u30C1\u30CB\u30D2\u30DF\u30EA\u30F0\u30AE\u30B8\u30C2\u30D3\u30D4\u30A6\u30A5\u30AF\u30B9\u30C4\u30CC\u30D5\u30E0\u30E6\u30E5\u30EB\u30B0\u30BA\u30D6\u30C5\u30D7\u30A8\u30A7\u30B1\u30BB\u30C6\u30CD\u30D8\u30E1\u30EC\u30F1\u30B2\u30BC\u30C7\u30D9\u30DA\u30AA\u30A9\u30B3\u30BD\u30C8\u30CE\u30DB\u30E2\u30E8\u30E7\u30ED\u30F2\u30B4\u30BE\u30C9\u30DC\u30DD\u30F4\u30C3\u30F30123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// packages/backend/src/api.ts
var discoveryModule = null;
var probeModule = null;
function initializeModules(discovery, probe) {
  discoveryModule = discovery;
  probeModule = probe;
}

// packages/backend/src/index.ts
import { Request as FetchRequest, fetch as fetch2, Request as Request2 } from "caido:http";
function init(sdk) {
  const discoveryModule2 = new DiscoveryModule(sdk);
  const probeModule2 = new ProbeModule(sdk);
  initializeModules(discoveryModule2, probeModule2);
  sdk.api.register("ssrf-scanner.processRequest", async (sdk2, requestData) => {
    sdk2.console.log("Backend: Received request data:", requestData);
    try {
      if (!requestData || typeof requestData !== "object") {
        return JSON.stringify({ success: false, error: "Invalid request data: not an object." });
      }
      if (typeof requestData.url !== "string" || requestData.url.trim() === "") {
        return JSON.stringify({ success: false, error: `Invalid URL: Expected a non-empty string, got ${typeof requestData.url}.` });
      }
      if (typeof requestData.method !== "string" || requestData.method.trim() === "") {
        return JSON.stringify({ success: false, error: `Invalid Method: Expected a non-empty string, got ${typeof requestData.method}.` });
      }
      if (typeof requestData.headers !== "object" || requestData.headers === null) {
        return JSON.stringify({ success: false, error: `Invalid Headers: Expected an object, got ${typeof requestData.headers}.` });
      }
      if (typeof requestData.body !== "string") {
        return JSON.stringify({ success: false, error: `Invalid Body: Expected a string, got ${typeof requestData.body}.` });
      }
      let urlString = requestData.url;
      if (!urlString.startsWith("http://") && !urlString.startsWith("https://")) {
        urlString = "http://" + urlString;
      }
      let url;
      try {
        url = new URL(urlString);
        sdk2.console.log("Backend: Created URL object:", url.toString());
      } catch (urlError) {
        sdk2.console.error("Backend: Invalid URL:", urlString);
        return JSON.stringify({
          success: false,
          error: `Invalid URL: ${urlString}. Please ensure the URL is properly formatted.`
        });
      }
      const request = new FetchRequest(url, {
        method: requestData.method,
        headers: requestData.headers,
        body: requestData.body || ""
        // Ensure body is never undefined
      });
      request.host = url.host;
      request.path = url.pathname;
      sdk2.console.log("Backend: Created FetchRequest:", {
        url: request.url.toString(),
        method: request.method,
        host: url.host,
        path: url.pathname,
        headers: Object.fromEntries(request.headers.entries())
      });
      let response = await fetch2(request);
      if (discoveryModule2.isEnabled) {
        sdk2.console.log("Backend: Discovery module enabled, processing request...");
        const finding = await discoveryModule2.processRequest(request);
        sdk2.console.log("Backend: Discovery module result:", finding ? "Found new endpoint" : "No new endpoint");
        if (finding) {
          response = {
            success: true,
            message: "New endpoint discovered",
            finding
          };
        }
      } else {
        sdk2.console.log("Backend: Discovery module disabled");
      }
      if (probeModule2.isEnabled) {
        sdk2.console.log("Backend: Probe module enabled, sending probe...");
        const probeResult = await probeModule2.sendProbe(request);
        if (probeResult) {
          sdk2.console.log("Backend: Probe result:", JSON.stringify(probeResult, null, 2));
          const finding = discoveryModule2.getFindingByRequest(request);
          if (finding) {
            finding.probeStatus = probeResult.probeStatus;
            finding.probeTimestamp = (/* @__PURE__ */ new Date()).toISOString();
            finding.probeRequest = probeResult.probeRequest;
            finding.probeResponse = {
              status: probeResult.status,
              headers: probeResult.headers,
              body: probeResult.body
            };
            sdk2.api.call("ssrf-scanner.updateFinding", finding);
            sdk2.console.log("Backend: Updated finding with probe details, status:", probeResult.probeStatus);
          }
        } else {
          sdk2.console.log("Backend: No probe response received");
        }
      } else {
        sdk2.console.log("Backend: Probe module disabled");
      }
      const responseString = JSON.stringify(response);
      sdk2.console.log("Backend: Sending response:", responseString);
      return responseString;
    } catch (error) {
      sdk2.console.error("Backend: Error processing request:", error);
      const errorResponse = JSON.stringify({
        success: false,
        error: error?.toString() || "Unknown error"
      });
      sdk2.console.log("Backend: Sending error response:", errorResponse);
      return errorResponse;
    }
  });
  sdk.api.register("ssrf-scanner.enableDiscovery", async () => {
    try {
      discoveryModule2.isEnabled = true;
      sdk.console.log("Discovery module enabled");
      return "Discovery module enabled";
    } catch (error) {
      sdk.console.error(`Failed to enable discovery module: ${error}`);
      return `Failed to enable discovery module: ${error}`;
    }
  });
  sdk.api.register("ssrf-scanner.disableDiscovery", async () => {
    try {
      discoveryModule2.isEnabled = false;
      sdk.console.log("Discovery module disabled");
      return "Discovery module disabled";
    } catch (error) {
      sdk.console.error(`Failed to disable discovery module: ${error}`);
      return `Failed to disable discovery module: ${error}`;
    }
  });
  sdk.api.register("ssrf-scanner.enableProbe", async () => {
    try {
      probeModule2.isEnabled = true;
      sdk.console.log("Probe module enabled");
      return "Probe module enabled";
    } catch (error) {
      sdk.console.error(`Failed to enable probe module: ${error}`);
      return `Failed to enable probe module: ${error}`;
    }
  });
  sdk.api.register("ssrf-scanner.disableProbe", async () => {
    try {
      probeModule2.isEnabled = false;
      sdk.console.log("Probe module disabled");
      return "Probe module disabled";
    } catch (error) {
      sdk.console.error(`Failed to disable probe module: ${error}`);
      return `Failed to disable probe module: ${error}`;
    }
  });
  sdk.api.register("ssrf-scanner.getSettings", async () => {
    try {
      const settings = {
        discoveryEnabled: discoveryModule2.isEnabled,
        probeEnabled: probeModule2.isEnabled,
        debugLoggingEnabled: false
        // TODO: Add debug logging setting
      };
      return JSON.stringify(settings);
    } catch (error) {
      sdk.console.error(`Failed to get settings: ${error}`);
      return JSON.stringify({ error: `Failed to get settings: ${error}` });
    }
  });
  sdk.api.register("ssrf-scanner.getAllFindings", async () => {
    try {
      const findings = discoveryModule2.getAllFindings();
      sdk.console.log(`Retrieved ${findings.length} findings`);
      return JSON.stringify(findings);
    } catch (error) {
      sdk.console.error(`Failed to get findings: ${error}`);
      return JSON.stringify({ error: `Failed to get findings: ${error}` });
    }
  });
  sdk.api.register("ssrf-scanner.getFindingById", async (id) => {
    try {
      const finding = discoveryModule2.getFindingById(id);
      if (!finding) {
        return JSON.stringify({ error: "Finding not found" });
      }
      sdk.console.log(`Retrieved finding ${id}`);
      return JSON.stringify(finding);
    } catch (error) {
      sdk.console.error(`Failed to get finding ${id}: ${error}`);
      return JSON.stringify({ error: `Failed to get finding ${id}: ${error}` });
    }
  });
  sdk.events.onInterceptRequest(async (sdk2, request) => {
    try {
      sdk2.console.log("Backend: Starting request interception flow...");
      if (typeof sdk2.requests.inScope === "function") {
        sdk2.console.log(`Backend: Attempting to check scope for request ${request.getId()}`);
        const inScope = await sdk2.requests.inScope(request);
        if (!inScope) {
          sdk2.console.log(`Backend: Request ${request.getId()} not in scope, skipping.`);
          return;
        }
        sdk2.console.log(`Backend: Request ${request.getId()} is in scope, proceeding...`);
      } else {
        sdk2.console.warn(`Backend: sdk.requests.inScope is not a function. Bypassing scope check for request ${request.getId()}.`);
      }
      sdk2.console.log(`Backend: Intercepted in-scope request: ${request.getMethod()} ${request.getHost()}${request.getPath()}`);
      const url = (request.getTls() ? "https" : "http") + "://" + request.getHost() + request.getPath() + (request.getQuery() ? "?" + request.getQuery() : "");
      sdk2.console.log(`Backend: Reconstructed URL: ${url}`);
      const headersArray = request.getHeaders();
      const headers = {};
      for (const key in headersArray) {
        if (Object.prototype.hasOwnProperty.call(headersArray, key) && Array.isArray(headersArray[key]) && headersArray[key].length > 0) {
          headers[key] = headersArray[key][0];
        }
      }
      sdk2.console.log("Backend: Processed headers:", JSON.stringify(headers, null, 2));
      let body = "";
      const requestBody = request.getBody();
      if (requestBody) {
        body = requestBody.toText();
        sdk2.console.log("Backend: Request body extracted:", body.substring(0, 200) + (body.length > 200 ? "..." : ""));
      } else {
        sdk2.console.log("Backend: No request body found");
      }
      sdk2.console.log("Backend: Calling processRequest with extracted data...");
      try {
        const originalRequestObj = new Request2(url, {
          method: request.getMethod(),
          headers,
          body
        });
        originalRequestObj.host = request.getHost();
        originalRequestObj.path = request.getPath();
        if (discoveryModule2.isEnabled) {
          sdk2.console.log("Backend: Processing request through discovery module...");
          try {
            const finding = await discoveryModule2.processRequest(originalRequestObj);
            if (finding) {
              sdk2.console.log("Backend: New finding discovered:", finding);
            } else {
              sdk2.console.log("Backend: No new finding discovered");
            }
          } catch (error) {
            sdk2.console.error("Error processing request:", error);
          }
        }
        if (probeModule2.isEnabled) {
          sdk2.console.log("Backend: Processing request through probe module...");
          try {
            const probeRequest = new Request2(url, {
              method: request.getMethod(),
              headers,
              body
            });
            probeRequest.host = request.getHost();
            probeRequest.path = request.getPath();
            const probeResult = await probeModule2.sendProbe(probeRequest);
            if (probeResult) {
              sdk2.console.log("Backend: Probe result:", JSON.stringify(probeResult, null, 2));
              const finding = discoveryModule2.getFindingByRequest(request);
              if (finding) {
                finding.probeStatus = probeResult.probeStatus;
                finding.probeTimestamp = (/* @__PURE__ */ new Date()).toISOString();
                finding.probeRequest = probeResult.probeRequest;
                finding.probeResponse = {
                  status: probeResult.status,
                  headers: probeResult.headers,
                  body: probeResult.body
                };
                sdk2.api.call("ssrf-scanner.updateFinding", finding);
                sdk2.console.log("Backend: Updated finding with probe details, status:", probeResult.probeStatus);
              }
            } else {
              sdk2.console.log("Backend: No probe response received");
            }
          } catch (error) {
            sdk2.console.error("Backend: Error processing probe:", error);
          }
        } else {
          sdk2.console.log("Backend: Probe module disabled");
        }
      } catch (processError) {
        sdk2.console.error("Backend: Error processing request:", processError);
      }
    } catch (error) {
      sdk2.console.error("Backend: Error during onInterceptRequest callback:", error);
      sdk2.console.error(`Backend: Error message: ${error.message}`);
      sdk2.console.error(`Backend: Stack trace: ${error.stack}`);
    }
  });
  sdk.events.onInterceptResponse(async (sdk2, request, response) => {
    try {
      sdk2.console.log(`Backend: Intercepted response for request: ${request.getMethod()} ${request.getHost()}${request.getPath()}`);
      const finding = discoveryModule2.getFindingByRequest(request);
      if (finding) {
        sdk2.console.log("Backend: Found matching finding for response.");
        const responseBody = await response.text();
        const responseHeaders = Object.fromEntries(response.headers.entries());
        finding.originalResponse = {
          status: response.status,
          headers: responseHeaders,
          body: responseBody
        };
        sdk2.console.log("Backend: Updated finding with original response details:", {
          status: finding.originalResponse.status,
          headers: finding.originalResponse.headers,
          body: finding.originalResponse.body.substring(0, 100) + (finding.originalResponse.body.length > 100 ? "..." : "")
        });
        sdk2.api.call("ssrf-scanner.updateFinding", finding);
      } else {
        sdk2.console.log("Backend: No matching finding found for intercepted response.");
      }
    } catch (error) {
      sdk2.console.error("Backend: Error during onInterceptResponse callback:", error);
      sdk2.console.error(`Backend: Error message: ${error.message}`);
      sdk2.console.error(`Backend: Stack trace: ${error.stack}`);
    }
  });
  sdk.api.register("ssrf-scanner.updateFinding", async (sdk2, finding) => {
    try {
      discoveryModule2.updateFinding(finding);
      return { success: true };
    } catch (error) {
      sdk2.console.error("Error updating finding:", error);
      return { success: false, error: error?.toString() };
    }
  });
  sdk.console.log("SSRF Scanner plugin initialized");
}
export {
  init
};
