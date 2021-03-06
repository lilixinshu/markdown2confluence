var marked = require('marked');
var _ = require('min-util');
var qs = require('min-qs');
var inlineLexer = marked.inlineLexer;

module.exports = exports = markdown2confluence;

// https://roundcorner.atlassian.net/secure/WikiRendererHelpAction.jspa?section=all
// https://confluence.atlassian.com/display/DOC/Confluence+Wiki+Markup
// http://blogs.atlassian.com/2011/11/why-we-removed-wiki-markup-editor-in-confluence-4/

var MAX_CODE_LINE = 20;

function Renderer() { };

var rawRenderer = marked.Renderer;

var langArr = 'actionscript3 bash csharp coldfusion cpp css delphi diff erlang groovy java javafx javascript perl php none powershell python ruby scala sql vb html/xml'.split(/\s+/);
var langMap = {
	'actionscript3': 'actionscript3',
	'applescript': 'applescript',
	'bash': 'bash',
	'c#': 'c#',
	'csharp': 'c#',
	'c++': 'cpp',
	'cpp': 'cpp',
	'css': 'css',
	'coldfusion': 'coldfusion',
	'erlang': 'erl',
	'erl': 'erl',
	'groovy': 'groovy',
	'java': 'java',
	'javafx': 'jfx',
	'jfx': 'jfx',
	'javascript': 'js',
	'js': 'js',
	'php': 'php',
	'perl': 'perl',
	'text': 'text',
	'plain text': 'text',
	'powershell': 'powershell',
	'python': 'py',
	'ruby': 'ruby',
	'sql': 'sq',
	'sass': 'sass',
	'scala': 'scala',
	'vb': 'vb',
	'visualbasic': 'vb',
	'diff': 'diff',
	'shell': 'bash',
	'html': 'xml',
	'xml': 'xml'
};
for (var i = 0, x; x = langArr[i++];) {
	langMap[x] = x;
}

var escape = function(text){
	text = text.replace(/\{\{/g, '__markdown2confluence_brackets_front__').replace(/\{/g, '\\{').replace(/__markdown2confluence_brackets_front__/g, '{{');
	text = text.replace(/\}\}/g, '__markdown2confluence_brackets_end__').replace(/\}/g, '\\}').replace(/__markdown2confluence_brackets_end__/g, '}}');
	text = text.replace(/\[/g,"\\[").replace(/\]/g,"\\]");
	text = text.replace(/\\</g, '<').replace(/\\\&lt;/g, '<').replace(/\\>/g,'>').replace(/\\\&gt;/g,'>');
	text = text.replace(/__markdown2confluence_square_front__/g, '[').replace(/__markdown2confluence_square_end__/g, ']');
	return text;
}

_.extend(Renderer.prototype, rawRenderer.prototype, {
	paragraph: function (text) {
		// text = text.replace(/\{\{/g, '__markdown2confluence_brackets_front__').replace(/\{/g, '\\{').replace(/__markdown2confluence_brackets_front__/g, '{{');
		// text = text.replace(/\}\}/g, '__markdown2confluence_brackets_end__').replace(/\}/g, '\\}').replace(/__markdown2confluence_brackets_end__/g, '}}');
		// text = text.replace(/\[/g,"\\[").replace(/\]/g,"\\]");
		return escape(text) + '\n\n';
	}
	, html: function (html) {
		return html;
	}
	, heading: function (text, level, raw) {
		return 'h' + level + '. ' + text + '\n\n';
	}
	, strong: function (text) {
		return '*' + text + '*';
	}
	, em: function (text) {
		return '_' + text + '_';
	}
	, del: function (text) {
		return '-' + text + '-';
	}
	, codespan: function (text) {
		return '{{' + text + '}}';
	}
	, blockquote: function (quote) {
		return '{quote}' + quote + '{quote}';
	}
	, br: function () {
		return '\n';
	}
	, hr: function () {
		return '----';
	}
	, link: function (href, title, text) {
		var arr = [href];
		if (text) {
			arr.unshift(text);
		}
		return '__markdown2confluence_square_front__' + arr.join('|') + '__markdown2confluence_square_end__';
	}
	, list: function (body, ordered) {
		var arr = _.filter(_.trim(body).split('\n'), function (line) {
			return line;
		})
		var type = ordered ? '#' : '*';
		return _.map(arr, function (line) {
			return type + ' ' + escape(line);
		}).join('\n') + '\n\n';

	}
	, listitem: function (body, ordered) {
		return body + '\n';
	}
	, image: function (href, title, text) {
		return '!' + href + '!';
	}
	, table: function (header, body) {
		return header + body + '\n';
	}
	, tablerow: function (content, flags) {
		return content + '\n';
	}
	, tablecell: function (content, flags) {
		var type = flags.header ? '||' : '|';
		return type + content;
	}
	, code: function (code, lang) {
		// {code:language=java|borderStyle=solid|theme=RDark|linenumbers=true|collapse=true}
		if (lang) {
			lang = lang.toLowerCase();
		}
		lang = langMap[lang] || 'none';
		var param = {
			language: lang,
			borderStyle: 'solid',
			theme: 'RDark', // dark is good
			linenumbers: true,
			collapse: false
		};
		var lineCount = _.split(code, '\n').length;
		if (lineCount > MAX_CODE_LINE) {
			// code is too long
			//param.collapse = true
		}
		param = qs.stringify(param, '|', '=');
		return '{code:' + param + '}\n' + code + '\n{code}\n\n';
	}
})

var renderer = new Renderer();

function markdown2confluence(markdown) {
	return marked(markdown, { renderer: renderer });
}
