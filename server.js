var framework        =    require('express');
var http             =    require('http').Server(framework);
const file           =   require('./alat/bacafile');
const kode           =   require('./alat/enkripsi');
const bacagaris      =    require('readline');
const fs             =    require('fs');
const ora            =    require('ora');
var mysql_module     =    require('mysql');
const perintah       =    bacagaris.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'Perintah > '
});

perintah.prompt();

perintah.on('line', (line) => {
    switch (line.trim()) {
        case 'jalankan':
            Jalankan();
            break;
        case 'tutup':
            perintah.close();
            break;
        default:
            console.log('============ Perintah tidak tersedia ==========');
            perintah.prompt();
            break;
    }
});

var path_konfig         =   'konfig/setting';
var format_save         =   '.adi';

function Jalankan() {
    if (fs.existsSync(path_konfig+format_save)) {
        
    } else {
        perintah.close();
        SettingServer();  
    }
}

var   localhost_set    =   [];
var   kridensial_mysql =   [];

function SettingServer() {
    console.log('====================================================');
    console.log('============= mengkonfigurasi server ===============');
    console.log('====================================================');

    const konfig        =       bacagaris.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: 'Konfigurasi > '
    });

    konfig.prompt();

    konfig.on('line',(line) => {
        switch (line.trim()) {
            case 'mysql server':
                  konfig.close();
                  mysql();
                break;
            case 'cek server':
                console.log('alamat server mysql adalah = ' +localhost_set[0]);
                konfig.prompt();
                break;
            case 'unset server':

                if (localhost_set.length <= 0) {
                    console.log('========= alamat server belum diset ===================================');
                    konfig.prompt();
                } else {
                    localhost_set.pop();
                    console.log('Alamat Server Terhapus');
                    konfig.prompt();
                }
                break;
            case 'kridensial mysql':
                if (kridensial_mysql.length <= 0) {
                konfig.close();
                kridensialMysql();                    
                } else {
                    console.log('kridensial mysql sudah terseting untuk menghapusnya ketik unset kridensial');
                    konfig.prompt();
                }
                break;
            case 'cek user mysql':
                if (kridensial_mysql.length <= 0) {
                  console.log('belum di set');
                  konfig.prompt();
                } else {
                  console.log('user:     '+ kridensial_mysql[0].user);
                  console.log('Password: '+ kridensial_mysql[0].password);
                  konfig.prompt();
                }
                break;
            case 'unset kridensial':
                if (kridensial_mysql.length <= 0) {
                    console.log('========================= kridensial mysql belum diset ==============================');
                    konfig.prompt();
                } else {
                    kridensial_mysql.pop();
                    console.log('=============================  kridensial mysql unset berhasil ==========================');
                    konfig.prompt();
                }

                break;
            case 'hubungkan':
                konfig.close();            
                hubungkan();
                break;
            default:
                console.log('=========================================================================================');
                console.log('================================== perintah tersedia ====================================');
                console.log('mysql server                                       setting alamat server mysql localhost');
                console.log('cek server                                   perintah untuk mengecek alamat server mysql');
                console.log('unset server                                               menghapus alamat server msyql');
                console.log('kridensial mysql                                                          set user mysql');
                console.log('cek user mysql                                            mengecek kridensial user msyql');
                console.log('hubungkan                        untuk menyambungkan ke server dan menyimpan konfigurasi');
                console.log('unset kridensial                                   untuk menghapus kridensial user mysql');
                console.log('=========================================================================================');
                konfig.prompt();
                break;
        }
    });   
}

function hubungkan() {
    let   server  = localhost_set[0];
    if (localhost_set.length <= 0) {
        console.log('Alamat server belum di set');
        return SettingServer();
    } else {
        const spinner   =   ora(server+ ' Menghubungkan').start();
        const  database      =     bacagaris.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: 'Setting Database >'
        });        
        var   koneksi        =   mysql_module.createConnection({
            host:       localhost_set[0],
            user:       kridensial_mysql[0].user,
            password:   kridensial_mysql[0].password
        });  
        koneksi.connect(function(pusing) {
            if (pusing) {
                spinner.fail(['Mysql tidak terhubung']);
                database.close();
                return SettingServer();
            } else {
                spinner.succeed(['mysql terhubung']);
                database.prompt();
            }
        });
    }


}

function mysql() {
    const  localhost    =   bacagaris.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: 'localhost > '        
    });
    localhost.prompt();
    localhost.on('line', (line) => {
        if (line.length <= 0) {
            console.log('localhost host tidak boleh kosong');
            localhost.prompt();
        } else {

            if (localhost_set <= 0) {
                localhost_set.push(line);
                console.log(line+ ' Sudah di set');
                localhost.close();
                return SettingServer();
            } else {
                console.log('mysql sudah ter set');
                localhost.close();
                return SettingServer();
            }
        }
    });
}

function kridensialMysql() {
    const   kridensial_user     =    bacagaris.createInterface({
        input:      process.stdin,
        output:     process.stdout,
        prompt:    'user mysql > '
    });
    kridensial_user.prompt();
    kridensial_user.on('line',(line) => {
        if (line.length <= 0) {
            console.log('user mysql tidak boleh kosong');
        } else {
            kridensial_user.close();
            PasswordMysql(line);
        }
    });
}

var Writable = require('stream').Writable;

function PasswordMysql(user) {
    var mutableStdout   =   new Writable({
        write: function(chunk, encoding, callback) {
            if(!this.muted)
            process.stdout.write(chunk,encoding);
            callback();
        }
    });

    mutableStdout.muted     =  false;
    var password            =  bacagaris.createInterface({
        input:     process.stdin,
        output:    mutableStdout,
        terminal:  true
    });

    password.question('Password: ', function(password) {
        kridensial_mysql.push({user: user, password: password});
        console.log('=========== kridensial mysql terset =============');
        return SettingServer();
    });
    mutableStdout.muted     =   true;
}