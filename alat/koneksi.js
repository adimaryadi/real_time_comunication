var mysql_           =    require('mysql');
const kode           =    require('./enkripsi');

var path_konfig         =   'konfig/setting';
var format_save         =   '.adi';

module.exports          =   {
    database: function(data,callback) {
        let file_setting    =    kode.terjemaah(path_konfig+format_save);
        let setting_json    =    JSON.parse(file_setting);
        let koneksi         =    mysql_.createConnection({
            host:           setting_json.server_ip,
            user:           setting_json.user,
            password:       setting_json.password,
            database:       setting_json.database
        });

        koneksi.connect(function(pusing) {
            if (pusing) {
                console.log(pusing);
                return 'pusing';
            } else {
                koneksi.query(data, function(pusing,hasil) {
                    if (pusing) {                       
                        let hasil          =   'query_salah';
                        callback(hasil);
                    } else {
                        // let hasil        =   'sukses';
                        callback(hasil);
                    }
                });
            }
        });
    }
};