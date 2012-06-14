/*
This file is part of the GhostDriver project from Neustar inc.

Copyright (c) 2012, Ivan De Marino <ivan.de.marino@gmail.com> - Neustar inc.
Copyright (c) 2012, Alex Anderson <@alxndrsn>
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright notice,
      this list of conditions and the following disclaimer in the documentation
      and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var ghostdriver = ghostdriver || {};

ghostdriver.WebElementReqHand = function(id, session) {
    // private:
    var
    _id = id + '',      //< ensure this is always a string
    _session = session,
    _locator = new ghostdriver.WebElementLocator(_session),
    _protoParent = ghostdriver.WebElementReqHand.prototype,
    _const = {
        VALUE           : "value",
        SUBMIT          : "submit",
        DISPLAYED       : "displayed",
        ATTRIBUTE       : "attribute",
        NAME            : "name",
        ELEMENTS        : "elements",
        TEXT            : "text",
        EQUALS          : "equals",
        CLEAR           : "clear",
        CSS             : "css",
        CLICK           : "click"
    },
    _errors = require("./errors.js"),

    _handle = function(req, res) {
        _protoParent.handle.call(this, req, res);

        // console.log("Request => " + JSON.stringify(req, null, '  '));

        // TODO lots to do...

        if (req.urlParsed.file === _const.VALUE && req.method === "POST") {
            _valueCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.SUBMIT && req.method === "POST") {
            _submitCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.DISPLAYED && req.method === "GET") {
            _getDisplayedCommand(req, res);
            return;
        } else if (req.urlParsed.chunks[0] === _const.ATTRIBUTE && req.method === "GET") {
            _getAttributeCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.NAME && req.method === "GET") {
            _getNameCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.ELEMENTS && req.method === "POST") {
            _postElementsCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.TEXT && req.method === "GET") {
            _getTextCommand(req, res);
            return;
        } else if (req.urlParsed.chunks[0] === _const.EQUALS && req.method === "GET") {
            _getEqualsCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.CLEAR && req.method === "POST") {
            _postClearCommand(req, res);
            return;
        } else if (req.urlParsed.chunks[0] === _const.CSS && req.method === "GET") {
            _getCssCommand(req, res);
            return;
        } else if (req.urlParsed.file === _const.CLICK && req.method === "POST") {
            _postClickCommand(req, res);
            return;
        } // else ...

        // TODO lots to do...

        throw _errors.createInvalidReqInvalidCommandMethodEH(req);
    },

    _getDisplayedCommand = function(req, res) {
        var isDisplayedAtom = require("./webdriver_atoms.js").get("is_displayed");
        var displayed = _session.getCurrentWindow().evaluate(isDisplayedAtom, _getJSON());
        res.respondBasedOnResult(_session, req, displayed);
    },

    _valueCommand = function(req, res) {
        var i, ilen,
            postObj = JSON.parse(req.post),
            typeAtom = require("./webdriver_atoms.js").get("type"),
            typeRes;

        // Ensure all required parameters are available
        if (typeof(postObj) === "object" && typeof(postObj.value) === "object") {
            // Execute the "type" atom
            typeRes = _getSession().getCurrentWindow().evaluate(typeAtom, _getJSON(), postObj.value);

            // TODO - Error handling based on the value of "typeRes"

            res.success(_session.getId());
            return;
        }

        throw _errors.createInvalidReqMissingCommandParameterEH(req);
    },

    _postClearCommand = function(req, res) {
        var result = _session.getCurrentWindow().evaluate(
                require("./webdriver_atoms.js").get("clear"),
                _getJSON());
        res.respondBasedOnResult(_session, req, result);
    },

    _getCssCommand = function(req, res) {
        var result = _session.getCurrentWindow().evaluate(
                require("./webdriver_atoms.js").get("execute_script"),
                "return window.getComputedStyle(arguments[0]).getPropertyValue(arguments[1]);",
                [_getJSON(), req.urlParsed.file]);

        res.respondBasedOnResult(_session, req, result);
    },

    _getNameCommand = function(req, res) {
        var result = _session.getCurrentWindow().evaluate(
                require("./webdriver_atoms.js").get("execute_script"),
                "return arguments[0].tagName;",
                [_getJSON()]);

        // Convert value to a lowercase string as per WebDriver JSONWireProtocol spec
        // @see http://code.google.com/p/selenium/wiki/JsonWireProtocol#/session/:sessionId/element/:id/name
        if(result.status === 0) {
            result.value = result.value.toLowerCase();
        }

        res.respondBasedOnResult(_session, req, result);
    },

    _getAttributeCommand = function(req, res) {
        var attributeValueAtom = require("./webdriver_atoms.js").get("get_attribute_value"),
            result;

        if (typeof(req.urlParsed.file) !== "undefined") {
            // Read the attribute
            result = _session.getCurrentWindow().evaluate(
                attributeValueAtom,     // < Atom to read an attribute
                _getJSON(),             // < Element to read from
                req.urlParsed.file);    // < Attribute to read

            res.respondBasedOnResult(_session, req, result);
            return;
        }

        throw _errors.createInvalidReqMissingCommandParameterEH(req);
    },

    _getNameCommand = function(req, res) {
        var result = _session.getCurrentWindow().evaluate(
            require("./webdriver_atoms.js").get("execute_script"),
            "return arguments[0].tagName;",
            [_getJSON()]);
        // N.B. must convert value to a lowercase string as per WebDriver JSONWireProtocol spec
        if(result.status === 0) result.value = result.value.toLowerCase();
        res.respondBasedOnResult(_session, req, result);
    },

    _getAttributeCommand = function(req, res) {
        var attributeValueAtom = require("./webdriver_atoms.js").get("get_attribute_value"),
            attributeName = req.urlParsed.file,
            response = _session.getCurrentWindow().evaluate(attributeValueAtom, _getJSON(), attributeName);
        res.respondBasedOnResult(_session, req, response);
    },

    _getTextCommand = function(req, res) {
        var textAtom = require("./webdriver_atoms.js").get("get_text");
        var response = _session.getCurrentWindow().evaluate(textAtom, _getJSON());
        res.respondBasedOnResult(_session, req, response);
    },

    _getEqualsCommand = function(req, res) {
        // TODO this appears to work, but I don't know a decent way to test it
        var result = _session.getCurrentWindow().evaluate(
            require("./webdriver_atoms.js").get("execute_script"),
            "return arguments[0].isSameNode(arguments[1]);",
            [_getJSON(), _getJSON(req.urlParsed.file)]);
        res.success(_session.getId(), false);
    },

    _submitCommand = function(req, res) {
        var submitRes,
            submitAtom = require("./webdriver_atoms.js").get("submit");

        // Listen for the page to Finish Loading after the submit
        _getSession().getCurrentWindow().setOneShotCallback("onLoadFinished", function(status) {
            if (status === "success") {
                res.success(_session.getId());
            }

            // TODO - what do we do if this fails?
            // TODO - clear thing up after we are done waiting
        });

        submitRes = _getSession().getCurrentWindow().evaluate(submitAtom, _getJSON());

        // TODO - Error handling based on the value of "submitRes"
    },

    _postElementsCommand = function(req, res) {
        // Search for WebElements in this element
        // TODO should handle XPathLookupError - probably an exception will be thrown by the locator
        console.log("_postElementsCommand() :: locating elements...");
        var elements = _locator.locateElements(JSON.parse(req.post), _getJSON());
        console.log("_postElementsCommand() :: got elements (JSON string):" + JSON.stringify(elements));

        res.success(_session.getId(), elements);
    },

    _postClickCommand = function(req, res) {
        var clickAtom = require("./webdriver_atoms.js").get("click");
            result = _session.getCurrentWindow().evaluate(clickAtom, _getJSON());
console.log("_postClickCommand :: result=" + result);
        // TODO handle errors
        //throw _errors.createInvalidReqInvalidCommandMethodEH(req);
        res.success(_session.getId());
    },

    _getJSON = function(elementId) {
        return {
            "ELEMENT" : elementId || _getId()
        };
    },

    _getId = function() { return _id; },
    _getSession = function() { return _session; };

    // public:
    return {
        handle : _handle,
        getId : _getId,
        getJSON : _getJSON,
        getSession : _getSession//,
        // isAttachedToDOM : _isAttachedToDOM,
        // isVisible : _isVisible
    };
};
// prototype inheritance:
ghostdriver.WebElementReqHand.prototype = new ghostdriver.RequestHandler();
