const CONFIG = {
    host: 'http://127.0.0.1:8080'
};

export default class Network {
    gate = CONFIG['host'] + '/api';

    constructor() {
        this._patchXHRBinary();
    }

    _patchXHRBinary() {
        if (!XMLHttpRequest.prototype.sendAsBinary) {
            XMLHttpRequest.prototype.sendAsBinary = function (sData) {
                let nBytes = sData.length, ui8Data = new Uint8Array(nBytes);
                for (let nIdx = 0; nIdx < nBytes; nIdx++) {
                    ui8Data[nIdx] = sData.charCodeAt(nIdx) & 0xff;
                }
                this.send(ui8Data);
            };
        }
    }

    sendRequest(method, url, data, options, progressCallback) {
        return new Promise((resolve, reject) => {
            if (window.navigator.onLine === false) {
                return reject({
                    status: 0,
                    response: false,
                    statusText: 'Offline mode'
                });
            }

            try {
                let xhr = new XMLHttpRequest();
                let sBoundary = '';
                xhr.withCredentials = true;
                xhr.open(method, url);
                if (options.json) {
                    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
                }
                if (options.binary) {
                    sBoundary = "----File" + Date.now().toString(16);
                    xhr.setRequestHeader("Content-Type", `multipart\/form-data; boundary=${sBoundary}`);
                }
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            //success
                        } else {
                            return reject({
                                status: xhr.status,
                                response: xhr.response,
                                statusText: xhr.statusText
                            });
                        }
                    }
                };
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        return resolve({status: xhr.status, response: xhr.response});
                    } else {
                        return reject({
                            status: xhr.status,
                            response: xhr.response,
                            statusText: xhr.statusText
                        });
                    }
                };
                xhr.onabort = xhr.ontimeout = xhr.onerror = () => {
                    return reject({
                        status: xhr.status || 0,
                        response: false,
                        statusText: xhr.statusText || "Network Error"
                    });
                };
                if (progressCallback !== undefined && typeof progressCallback === 'function') {
                    xhr.onprogress = (e) => {
                        let prc = parseInt(e.loaded * (100 / e.total));
                        progressCallback(prc, e.loaded, e.total);
                    };
                }

                if (options.headers) {
                    Object.keys(options.headers).forEach(key => {
                        xhr.setRequestHeader(key, options.headers[key]);
                    });
                }
                if (options.serialize && data && typeof data === 'object') {
                    data = Object.keys(data).map(key => {
                        return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
                    }).join('&');
                }

                if (options.binary) {
                    xhr.sendAsBinary(`--${sBoundary}` + "\r\n"
                        + "Content-Disposition: form-data; name=\"data\"\r\n\r\n"
                        + data + `--${sBoundary}--` + "\r\n");
                } else {
                    xhr.send(data);
                }
            } catch (e) {
                return reject({
                    status: 0,
                    response: false,
                    statusText: 'Network Error'
                });
            }
        });
    };

    sendHTTPRequest(method, url, data, options, callback, progressCallback) {
        if (options === undefined) options = {json: true};
        if (options.json === undefined) options.json = true;
        this.sendRequest(method, this.gate + url, options.json ? JSON.stringify(data) : data, options, progressCallback).then(
            (response) => {
                if (callback) callback(response);
            },
            (response) => {
                if (callback) callback(false, response);
            }
        )
    };

    sendHTTPFile(method, url, data, options, callback, progressCallback) {
        if (options === undefined) options = {};
        options.json = false;
        options.binary = false;
        this.sendHTTPRequest(method, url, data, options, callback, progressCallback);
    }

    sendGET(url, data, callback, options) {
        this.sendHTTPRequest('GET', url, data, options, callback);
    };

    sendPOST(url, data, callback, options) {
        this.sendHTTPRequest('POST', url, data, options, callback);
    };

    sendPUT(url, data, callback, options) {
        this.sendHTTPRequest('PUT', url, data, options, callback);
    };

    sendPATCH(url, data, callback, options) {
        this.sendHTTPRequest('PATCH', url, data, options, callback);
    };

    sendDELETE(url, data, callback, options) {
        this.sendHTTPRequest('DELETE', url, data, options, callback);
    };
}
