/*
This file is part of the GhostDriver project from Neustar inc.

Copyright (c) 2012, Ivan De Marino <ivan.de.marino@gmail.com> - Neustar inc.
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
// On my machine, the following prints:
//StatusReqHand :: Ghostdriver.system=System(name = "")
//StatusReqHand :: Ghostdriver.system.os=undefined
console.log("StatusReqHand :: Ghostdriver.system=" + ghostdriver.system);
console.log("StatusReqHand :: Ghostdriver.system.os=" + ghostdriver.system.os);

ghostdriver.StatusReqHand = function() {
    // private:
    var _protoParent = ghostdriver.StatusReqHand.prototype;
    var _statusObj = {
        "build" : {
            "version"   : "1.0-dev",
            "revision"  : "unknown",
            "time"      : "unknown"
        },
        "os" : {
            // This breaks on my machine - 'os' is undefined
            //"name"      : ghostdriver.system.os.name,
            //"version"   : ghostdriver.system.os.version,
            //"arch"      : ghostdriver.system.os.architecture
            // From previous GD:
            "arch" : "x86",
            "name" : "osx",
            "version" : "10.7.2"
        }
    };

    var _handle = function(req, res) {
        _protoParent.handle.call(this, req, res);

        if (req.method === "GET" && req.urlParsed.file === "status") {
            res.success(null, _statusObj);
            return;
        }

        throw require("./errors.js").createInvalidReqInvalidCommandMethodEH(req);
    };

    // public:
    return {
        handle : _handle
    };
};
// prototype inheritance:
ghostdriver.StatusReqHand.prototype = new ghostdriver.RequestHandler();
