var fs   =    require('fs');

module.exports          =       {
    baca: function(data,panggilkembali) {
        fs.readFile(data,'utf8', function(pusing, isi) {
            let hasil   =   isi.toString();
            return panggilkembali(hasil);
        });
    }
}