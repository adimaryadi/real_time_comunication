const enkripsi       =   require('crypto');
const FileSystem     =   require("fs");
const algorithm      =   'aes-256-cbc';
var atob             =   require('atob');
var btoa             =   require('btoa');
const key            =   enkripsi.randomBytes(32);
const iv             =   enkripsi.randomBytes(16);

module.exports       =  {
    enkrip: function(data, path) {
        try {
            var cipher      =   enkripsi.createCipher(algorithm, 'penelitian_jaringan');
            var terengkrip  =   Buffer.concat([cipher.update(new Buffer.from(JSON.stringify(data),"utf8")), cipher.final()]);
            FileSystem.writeFileSync(path + '.adi',terengkrip);
            return;
        } catch (error) {
            console.log(error + 'pusing :');
        }
    },

    terjemaah: function(data) {
        try {
            var  data       =   FileSystem.readFileSync(data);
            var  decipher   =   enkripsi.createDecipher(algorithm,'penelitian_jaringan');
            var  terjemaah  =   Buffer.concat([decipher.update(data), decipher.final()]);
            return JSON.parse(terjemaah.toString());
        } catch (error) {
            console.log(error);
        }
    },

    komunikasi: function(data) {
        var terjemaahkan    =       atob(data);
        return terjemaahkan;
    },
    enkripkomunikasi: function(data) {
        var enkrip          =       btoa(data);
        return enkrip;
    },
    hapusfile: function(data) {
        FileSystem.unlink(data, (pusing) => {
            if(pusing) throw pusing;
            return console.log(data + ' Terhapus');
        });
    }
};