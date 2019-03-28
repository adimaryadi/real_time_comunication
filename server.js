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
        return Login();
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
            prompt: 'Database >'
        }); 
        if (kridensial_mysql.length <= 0) {
            console.log('=================================');
            console.log('==== kridensial belum diset =====');
            console.log('=================================');
            spinner.stop();
            database.close();
            return  SettingServer();
        } else {
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
                    database.on('line',(valuedb) => {
                        var dbhubungkan      =     mysql_module.createConnection({
                            host:       localhost_set[0],
                            user:       kridensial_mysql[0].user,
                            password:   kridensial_mysql[0].password,
                            database:   valuedb 
                        });
                        const spinner   =   ora(valuedb+ ' Menghubungkan database').start();
                        dbhubungkan.connect(function(pusing) {
                            if (pusing) {
                                spinner.fail([valuedb+ ' Database tidak ada']);
                                database.prompt();
                            } else {
                                spinner.succeed([valuedb+ ' Database Terhubung']);
                                database.close();
                                var simpan             =         bacagaris.createInterface({
                                    input:      process.stdin,
                                    output:     process.stdout,
                                    prompt:     'Konfigurasi Simpan > '
                                });
                                simpan.prompt();
                                simpan.on('line',(line) => {
                                    switch (line.trim()) {
                                        case 'ya':
                                            simpan.close();
                                            return Simpankonfig(valuedb);
                                            break;
                                        case 'tidak':
                                            simpan.close();
                                            return SettingServer();
                                            break;
                                        default:
                                            console.log('================================================');
                                            console.log('============ Pilih ya atau tidak ===============');
                                            console.log('================================================');
                                            simpan.prompt();
                                            break;
                                    }
                                });
                            }
                        });
                    });
                }
            });
        }

    }
}

function Simpankonfig(database) {
    var server_ip        =      localhost_set[0];
    var user             =      kridensial_mysql[0].user;
    var password         =      kridensial_mysql[0].password;

    var simpan_group     =      {
        server_ip:       server_ip,
        user:            user,
        password:        password,
        database:        database
    }
    
    let json_data       =     JSON.stringify(simpan_group);
    const loading       =     ora('Buat Tabel ').start();
    var koneksi         =     mysql_module.createConnection({
        host:           server_ip,
        user:           user,
        password:       password,
        database:       database
    });
    let password_enkrip        =        kode.enkripkomunikasi(password);
    koneksi.connect(function(pusing) {
        if (pusing) {
            loading.fail(['tidak dapat meyimpan']);
            return hubungkan();
        } else {
            var simpan_konfig    =    "CREATE TABLE konfig (server_ip VARCHAR(255),user VARCHAR(255),password TEXT,pilih_database VARCHAR(255))";
            koneksi.query(simpan_konfig, function(pusing, hasil) {
                if (pusing) {
                    loading.fail(['tidak dapat membuat tabel']);
                    return hubungkan();
                } else {
                    loading.succeed(['Tabel sudah dibuat']);
                    const tunggu_simpan      =     ora('Simpan Konfig').start();
                    var simpan_kfdb          =     "INSERT INTO konfig (server_ip,user,password,pilih_database) VALUES ('"+server_ip+"','"+user+"','"+password_enkrip+"','"+database+"')";
                    koneksi.query(simpan_kfdb, function(pusing, hasil) {
                        if (pusing) {
                            tunggu_simpan.fail(['konfig tidak tersimpan']);
                            return SettingServer();
                        } else {
                            tunggu_simpan.succeed(['Tersimpan']);
                            kode.enkrip(json_data, path_konfig);
                            return Jalankan();
                        }
                    });
                }
            });
        }
    });
    // kode.enkrip(json_data, path_konfig);
}

function mysql() {
    const  localhost    =   bacagaris.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: 'Server IP > '        
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

function Login() {
    
}