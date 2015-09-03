var MetaStream = require('@quarterto/meta-stream');
var isReadable = require('is-readable-stream');

var statusMethods = require('./status');
var headerMethods = require('./header');

var Response = MetaStream.use({
	getInitialMeta() {
		return {
			status: 200,
			timeout: 120,
			headers: {}
		}
	},

	pipe(res) {
		if(res.writeHead) res.writeHead(this.meta().status, this.meta().headers);
		if(res.setTimeout) res.setTimeout(this.meta().timeout);
		return MetaStream().pipe.call(this, res);
	},

	...headerMethods,

	status(status) {
		this.meta({status});
		return this;
	},

	header(k, v) {
		return this.headers({[k]: v});
	},

	headers(headers) {
		this.meta({headers});
		return this;
	},

	timeout(timeout) {
		this.meta({timeout});
		return this;
	}
}, {
	body(body) {
		return this(
			MetaStream.isStream(body)?  body
			: isReadable(body)?         body
			: /* otherwise */           [].concat(body)
		);
	},

	empty() {
		return this([]);
	},

	redirect(location, status = 302) {
		return this.empty().status(status).headers({location});
	},

	...statusMethods
});

module.exports = Response;
