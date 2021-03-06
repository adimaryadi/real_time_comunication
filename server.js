var framework        =    require('express')();
var http             =    require('http').Server(framework);
const file           =    require('./alat/bacafile');
const kode           =    require('./alat/enkripsi');
const bacagaris      =    require('readline');
const fs             =    require('fs');
const ora            =    require('ora');
var mysql_module     =    require('mysql');
const isNumber       =    require('is-number');
const detect         =    require('detect-port');
var io               =    require('socket.io')(http);
var database         =    require('./alat/koneksi');
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
        perintah.close();
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
    var login               =           bacagaris.createInterface({
        input:          process.stdin,
        output:         process.stdout,
        prompt:   'User Mysql > '
    });
    login.prompt();
    let file_login          =           kode.terjemaah(path_konfig+ format_save);
    let json_file           =           JSON.parse(file_login);
    login.on('line',(user) => {
        if (user == json_file.user) {
            login.close();
            return Password(json_file);
        } else {
            console.log('Akses ditolak');
            login.prompt();
        }
    });
}

function Password(data) {
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
        if (password == data.password) {
            return ControllerServer(data);
        } else {
            console.log('=========================================');
            console.log('=========== Password Salah ==============');
            console.log('=========================================');
            return Login();
        }
    });
    mutableStdout.muted     =   true;
}

function ControllerServer(data) {
    console.log('====================================================');
    console.log('===== Selamat Datang ' + data.user + ' =============');
    console.log('===== Perangkat lunak Versi 1.0.0 ==================');
    console.log('====================================================');
    var controller          =       bacagaris.createInterface({
        input:      process.stdin,
        output:     process.stdout,
        prompt:     data.user + ' > '
    });
    controller.prompt();

    controller.on('line', (control) => {
        switch (control.trim()) {
            case 'serve':
                controller.close();
                ServerRun();
                break;
            case 'unset port':
                controller.close();
                DeletePort();
                break;
            case 'serve berhenti':
                controller.close();
                ServeStop();
                break;
            case 'unset konfig':
                controller.close();
            return HapusKonfig(data);
            case 'migrasi auth':
                controller.close();
            return MigrasiAuth();
            case 'drop auth':
                controller.close();
            return DropAuth();
            case 'akses file': 
                controller.close();
            return Akses_file();
            default:
                console.log('serve                          Menjalankan Server');
                console.log('unset port             Menghapus Konfigurasi Port');
                console.log('serve berhenti                Menghentikan Server');
                console.log('unset konfig         Menghapus konfigurasi server');
                console.log('migrasi auth        Generate login singkat di web');
                console.log('akses file         Menjalankan layanan peyimpanan');
                controller.prompt();
            break;
        }
    });
}
const express         =       require('express');
const app             =       express();
let   path_port_file  =       'konfig/file_port';
function Akses_file() {
    // app.use('/file',express.static('assets'));
    // app.listen(port_file, () => console.log('Menjalankan file akses port 467'));
    if (fs.existsSync(path_port_file+format_save)) {
        let port_file          =        kode.terjemaah(path_port_file+format_save);
        app.use('/file',express.static('peyimpanan'));
        app.get('**', function(req,res) {
            res.send('File Not Found');
        });
        app.listen(port_file,() => {
            console.log('===============================================');
            console.log('==== Layanan peyimpanan berjalan akses port '+ port_file);
            console.log('===============================================');
            console.log('===============================================');
        });
        return ControllerServer(json_file);
    } else {
        let buat_port_file     =        bacagaris.createInterface({
            input:          process.stdin,
            output:         process.stdout,
            prompt:         'Isi Port contoh 4390 => '
        });
        buat_port_file.prompt();

        buat_port_file.on('line',(line) => {
            let huruf       =   /^[A-Za-z]+$/;
            if (line.length <= 1) {
                console.log('==================================================');
                console.log('====== Port tidak boleh kosong ===================');
                console.log('==================================================');
                buat_port_file.close();
                return Akses_file();
            } else if(line.match(huruf)) {
                console.log('==================================================');
                console.log('===== Tidak di izinkan menginput huruf ===========');
                console.log('==================================================');
                buat_port_file.close();
                return Akses_file();
            } else {
                kode.enkrip(line, path_port_file);
                buat_port_file.close();
                return Akses_file();                
            }
        });
    }
}

function DropAuth() {
    var pertanyaan             =        bacagaris.createInterface({
        input:             process.stdin,
        output:            process.stdout,
        prompt:            'Apakah Yakin auth didrop ? '
    });
    pertanyaan.prompt();

    pertanyaan.on('line', (line) => {
        switch (line.trim()) {
            case 'ya':
                TabelAuthDelete();
                break;
            case 'tidak':
                pertanyaan.close();
                return ControllerServer(json_file);
            default:
                console.log('=======================================================');
                console.log('=============== Jawab ya atau tidak ===================');
                console.log('=======================================================');
                break;
        }
    });
}

function TabelAuthDelete() {
    const deleteTabel      =      ora(['Drop table penguna']).start();
    let query              =      "DROP TABLE penguna";
    database.database(query, function(hasil) {
        if (hasil == 'query_salah') {
            deleteTabel.fail(['Gagal drop auth']);
            return ControllerServer(json_file);
        } else {
            
        }
    });
    
}

if (fs.existsSync(path_konfig+format_save)) {
    var Portal                 =        'konfig/port';
    let  file_konfig           =       kode.terjemaah(path_konfig+format_save);
    json_file                  =       JSON.parse(file_konfig);   
}

function HapusKonfig(data) {
    if (fs.existsSync(path_konfig+format_save)) {
        var koneksi         =    mysql_module.createConnection({
            host:           data.server_ip,
            user:           data.user,
            password:       data.password,
            database:       data.database
        });
        koneksi.connect(function(pusing) {
            if (pusing) {
                console.log('========== tidak dapat menghapus konfigurasi =====================');
                return ControllerServer(data);
            } else {
                var hapus_konfig    =    "DROP TABLE konfig";
                koneksi.query(hapus_konfig, function(pusing, hasil) {
                    if (pusing) {
                        console.log('================ tidak dapat menghapus file =================');
                    } else {
                        console.log('==================== konfigurasi dari database sudah dihapus ================');
                        fs.unlink(path_konfig+format_save, (pusing) => {
                            if (pusing) {
                                console.log('============= File konfigurasi tidak bisa di hapus ===================');
                                return  ControllerServer(json_file);
                            } else {
                                console.log('================ konfigurasi file sudah di hapus =========================');
                                console.log('================ Konfigurasi ulang ==================================');
                                return Jalankan();
                            }
                        });
                    }
                });
            }
        });

    } else {
        console.log('================== file konfig tidak ada =====================');
        return Jalankan();
    }
}


function MigrasiAuth() {
    const loading     =       ora('Migrasi authentifikasi').start();
    var koneksi       =       mysql_module.createConnection({
        host:        json_file.server_ip,
        user:        json_file.user,
        password:    json_file.password,
        database:    json_file.database
    });

    koneksi.connect(function(pusing) {
        if (pusing) {
            loading.fail(['Kesalahan kridensial => '+ pusing]);
            return ControllerServer(json_file);
        } else {
            loading.succeed(['Terhubung database']);
            const kirim_loading         =    ora(['Tabel penguna membuat ']).start();
            var buat_tabel_login        =    "CREATE TABLE penguna (id INT AUTO_INCREMENT PRIMARY KEY,nama VARCHAR(255), email VARCHAR(255),password TEXT NOT NULL)";
            koneksi.query(buat_tabel_login, function(pusing, hasil) {
                if (pusing) {
                    kirim_loading.fail(['Gagal Membuat tabel => '+ pusing]);
                    return ControllerServer(json_file);
                } else {
                    kirim_loading.succeed(['Tabel penguna termigrasi']);
                    let password           =       '1adimaryadiA';
                    let enkrip_AES         =        kode.enkripsi_AES(password);
                    var kirim_user         =       "INSERT INTO penguna (nama,email,password) VALUES ('admin','admin@realtime.com','"+enkrip_AES+"')";
                    const insert_user      =       ora(['penguna insert']).start();
                    koneksi.query(kirim_user, function(pusing, hasil) {
                        if (pusing) {
                            insert_user.fail(['penguna insert gagal => '+pusing]);
                            return ControllerServer(json_file);
                        } else {
                            insert_user.succeed(['user termigrasi']);
                            const tabel_token     =      ora(['Tabel token membuat']).start();
                            var   buat_tabel      =      "CREATE TABLE token_penguna (id INT AUTO_INCREMENT PRIMARY KEY,token TEXT NOT NULL, id_penguna VARCHAR(255),nama VARCHAR(255),ip_address VARCHAR(255))";
                            koneksi.query(buat_tabel, function(pusing, hasil) {
                                if (pusing) {
                                    tabel_token.fail(['tabel token_penguna tidak bisa di buat => '+ pusing]);
                                    return ControllerServer(json_file);
                                } else {
                                    tabel_token.succeed(['tabel token_penguna termigrasi']);
                                    console.log('=========================================================');
                                    console.log('================== Default Login Web Frontend ===========');
                                    console.log('====== Email : admin@realtime.com =======================');
                                    console.log('====== Password : '+ password+' =========================');
                                    console.log('====== Enkripsi AES : '+ enkrip_AES+' ===================');
                                    console.log('=========================================================');                                    
                                    return ControllerServer(json_file);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}



function ServeStop() {
    let data        =       kode.terjemaah(Portal+format_save);
    let port        =       data.port;
    detect(port, (pusing, __port) => {
        if (pusing) {
            console.log('============= gagal menghentikan server ===============');
            return ControllerServer(json_file);
        }

        if (port == __port) {
            console.log('=======================================================');
            console.log('================ Server tidak sedang berjalan ========');
            console.log('=======================================================');
            return ControllerServer(json_file);
        } else {
            http.close();
            console.log('================== Server Berhenti ====================');
            return ControllerServer(json_file);
        }
    });  
}

function DeletePort() {
    if (fs.existsSync(Portal+format_save)) {
        fs.unlink(Portal+format_save, (pusing) => {
            if (pusing) {
                console.log('========= gagal menghapus file ============');
                return ControllerServer(json_file);
            } else {
                console.log('========= Konfigurasi Port sudah dihapus ==');
                return ControllerServer(json_file);
            }
        });
    } else {
        console.log('============= Konfig port tidak ada ===============');
        return ControllerServer(json_file);
    }
}


function ServerRun() {
    if (fs.existsSync(Portal+format_save)) {
        JalankanServer();
    } else {
        return SettingPort();
    }
}

function WebControll() {
    framework.get('/', function(req,res) {
        res.sendFile(__dirname + '/login/index.html');
    });
    framework.get('/vendor/bootstrap/css/bootstrap.min.css', function(req,res) {
        res.sendFile(__dirname + '/login/vendor/bootstrap/css/bootstrap.min.css');
    });
    framework.get('/fonts/font-awesome-4.7.0/css/font-awesome.min.css', function(req,res) {
        res.sendFile(__dirname + '/login/fonts/font-awesome-4.7.0/css/font-awesome.min.css');
    });
    framework.get('/vendor/css-hamburgers/hamburgers.min.css', function(req,res) {
        res.sendFile(__dirname + '/login/vendor/css-hamburgers/hamburgers.min.css');
    });
    framework.get('/vendor/animate/animate.css', function(req,res) {
        res.sendFile(__dirname + '/login/vendor/animate/animate.css');
    });
    framework.get('/vendor/select2/select2.min.css', function(req,res) {
        res.sendFile(__dirname + '/login/vendor/select2/select2.min.css');
    });
    framework.get('/css/util.css', function(req,res) {
        res.sendFile(__dirname + '/login/css/util.css');
    });
    framework.get('/css/main.css', function(req,res) {
        res.sendFile(__dirname + '/login/css/main.css');
    });
    framework.get('/vendor/jquery/jquery-3.2.1.min.js', function(req,res) {
        res.sendFile(__dirname + '/login/vendor/jquery/jquery-3.2.1.min.js');
    });
    framework.get('/vendor/bootstrap/js/popper.js', function(req,res) {
        res.sendFile(__dirname + '/login/vendor/bootstrap/js/popper.js');
    });
    framework.get('/vendor/bootstrap/js/bootstrap.min.js', function(req,res) {
        res.sendFile(__dirname + '/login/vendor/bootstrap/js/bootstrap.min.js');
    });
    framework.get('/vendor/select2/select2.min.js', function(req,res) {
        res.sendFile(__dirname + '/login/vendor/select2/select2.min.js');
    });
    framework.get('/vendor/tilt/tilt.jquery.min.js', function(req,res) {
        res.sendFile(__dirname + '/login/vendor/tilt/tilt.jquery.min.js');
    });
    framework.get('/js/main.js', function(req,res) {
        res.sendFile(__dirname + '/login/js/main.js');
    });
    framework.get('/notify.js', function(req,res) {
        res.sendFile(__dirname + '/login/js/notify.js');
    });
    framework.get('/fonts/poppins/Poppins-Bold.ttf', function(req,res) {
        res.sendFile(__dirname + '/login/fonts/poppins/Poppins-Bold.ttf');
    });
    framework.get('/fonts/poppins/Poppins-Medium.ttf', function(req,res) {
        res.sendFile(__dirname + '/login/fonts/poppins/Poppins-Medium.ttf');
    });
    framework.get('/fonts/font-awesome-4.7.0/fonts/fontawesome-webfont.woff2', function(req,res) {
        res.sendFile(__dirname + '/login/fonts/font-awesome-4.7.0/fonts/fontawesome-webfont.woff2');
    });
    framework.get('/fonts/montserrat/Montserrat-Bold.ttf', function(req,res) {
        res.sendFile(__dirname + '/login/fonts/montserrat/Montserrat-Bold.ttf');
    });
    framework.get('/js/sweetalert.js', function(req,res) {
        res.sendFile(__dirname + '/login/js/sweetalert.js');
    });
    framework.get('/fonts/poppins/Poppins-Regular.ttf', function(req,res) {
        res.sendFile(__dirname + '/login/fonts/poppins/Poppins-Regular.ttf');
    });
    framework.get('/images/icons/favicon.ico', function(req,res) {
        res.sendFile(__dirname + '/login/images/icons/favicon.ico');
    });
    framework.get('/comunication.js', function(req,res) {
        res.sendFile(__dirname + '/login/js/comunication.js');
    });
    framework.get('/images/img-01.png', function(req,res) {
        res.sendFile(__dirname + '/login/images/img-01.png');
    });
    framework.get('/control', function(req,res) {
        res.sendfile(__dirname + '/control/index.html');
    });
    framework.get('/control/style.css', function(req,res) {
        res.sendfile(__dirname + '/control/style.css');
    });
    framework.get('/control/main.js', function(req,res) {
        res.sendfile(__dirname + '/control/main.js');
    });
    framework.get('/favicon.ico', function(req,res) {
        res.sendfile(__dirname + '/control/favicon.ico');
    });
    framework.get('/control/css/bootstrap.css', function(req,res) {
        res.sendFile(__dirname + '/control/css/bootstrap.css');
    });
    framework.get('/control/js/bootstrap.js', function(req,res) {
        res.sendFile(__dirname + '/control/js/bootstrap.js');
    });
}
let path_data             =      'data/route';
function JalankanServer() {
    let data        =       kode.terjemaah(Portal+format_save);
    let port        =       data.port;
    let cek_port    =       isNumber(port);
    if (cek_port == true) {
        detect(port, (pusing, __port) => {
            if (pusing) {
                console.log('============== gagal menjalankan server =================');
                return ControllerServer(json_file);
            }
            if (port == __port) {
                http.listen(port, function() {
                    console.log('=====================================================');
                    console.log('======== Server Berjalan Port Akses '+ port+ ' ======');
                    console.log('=====================================================');
                });
                WebControll();
                return ControllerServer(json_file);
            } else {
                console.log('============== Server Sedang Berjalan ===================');
                return ControllerServer(json_file);
            }
        });
    } else {
        console.log('================== Port Salah ====================');
        return ControllerServer(json_file);
    }
}

function SettingPort() {
    console.log('============== Port Belum disetting ===============');
    var  settingPort    =    bacagaris.createInterface({
        input:     process.stdin,
        output:    process.stdout,
        prompt:    'Setting Port > '
    });
    settingPort.prompt();
    settingPort.on('line',(line) => {
        let konfig      =       { port:  line };
        kode.enkrip(konfig, Portal);
        console.log('Port Tersimpan');
        settingPort.close();
        return ServerRun();
    });
}

// this socket communication
let path_token_save      =       'konfig/token/';
io.on('connection', function(socket) {
    socket.on('login', function(data) {
        return WebLogin(data);
    });
    socket.on('ip_request', function(ip) {
        console.log('===============================================');
        console.log('================ '+ ip+ ' =====================');
        console.log('====== Button login di klik ip tersebut =======');
        console.log('===============================================');
        console.log('===============================================');
    });
    socket.on('cek_token_control', function(token) {
        let terjemaah           =        kode.komunikasi(token);

        if (fs.existsSync(path_token_save+terjemaah+format_save)) {
            let file_token      =        kode.terjemaah(path_token_save+terjemaah+format_save);
            if (terjemaah == file_token) {
                io.emit('hasil_cek_control','betul');
            } else {
                io.emit('hasil_cek_control','salah');
            }
        } else {
            io.emit('hasil_cek_control','salah');
        }
    });
    socket.on('hapus_token',function(token) {
        let terjemaah            =      kode.komunikasi(token);
        fs.unlink(path_token_save+terjemaah+format_save, (pusing) => {
            if (pusing) {
                console.log('==================================================');
                console.log('==== token tidak bisa di hapus ===================');
                console.log('==================================================');
            }
            io.emit('hasil_hapus_token','token_terhapus');
        });
    });

    socket.on('route', function(data) {
        RouteSet(data);
    });

    socket.on('list_route', function(token) {
        DataRoute(token);
    });
    socket.on('unset_route', function(unset_route) {
        let terjemaah_token     =     kode.komunikasi(unset_route);
        let token_file          =     kode.terjemaah(path_token_save+terjemaah_token+format_save);
        if (token_file == terjemaah_token) {
            fs.unlink(path_data+format_save, (pusing) => {
                if (pusing) {
                    io.emit('unset_route_status','tidak_berhasil');
                }
                io.emit('unset_route_status','berhasil');
                console.log('============================================');
                console.log('====== Route Unset Frontend==');
            });
        } else {
            io.emit('unset_route_status','tidak_berhasil');
        }
    });
    socket.on('status_service', function(token) {
        CekService(token);
    });
});


function WebLogin(login) {
    let request_login      =     kode.komunikasi(login);
    let json_request       =     JSON.parse(request_login);
    let file_local         =     kode.terjemaah(path_konfig+format_save);
    let local_json         =     JSON.parse(file_local);
    if (json_request.user == local_json.user && json_request.password == local_json.password) {
        let status_kode    =     kode.enkripkomunikasi('betul');
        
        var date                =     new Date();
        var second              =     date.getSeconds();
        var file_kridensial     =     kode.terjemaah(path_konfig+format_save);
        var enkrip              =     kode.enkripkomunikasi(file_kridensial);
        var token               =     enkrip+second;
        console.log('===================================================');
        console.log('=== Set token '+ token+ ' =========================');
        console.log('===================================================');
        kode.enkrip(token, path_token_save+token);
        io.emit('login_status',status_kode);
        io.emit('token', token);
    } else {
        let status_kode    =     kode.enkripkomunikasi('salah');
        io.emit('login_status',status_kode);
    }
}

function RouteSet(data) {
    let terjemaah1        =      kode.komunikasi(data);
    let terjemaah_json    =      JSON.parse(terjemaah1);
    let token_            =      terjemaah_json.token;
    let terjemaah_token   =      kode.komunikasi(token_);
    
    if (fs.existsSync(path_token_save+terjemaah_token+format_save)) {
        let data_route           =     terjemaah_json.data;
        let terjemaah_data       =     kode.komunikasi(data_route);
        io.emit('status__route','sukses');
        kode.enkrip(terjemaah_data, path_data);
    } else {
        io.emit('hasil_cek','salah');
    }
}

function DataRoute(token) {
    let token_      =     kode.komunikasi(token);
    if(fs.existsSync(path_token_save+token_+format_save)) {
        if (fs.existsSync(path_data+format_save)) {
            let route_terjemaah     =    kode.terjemaah(path_data+format_save);
            let enkrip_komunikasi   =    kode.enkripkomunikasi(route_terjemaah);

            io.emit('hasil_route', enkrip_komunikasi);
        } else {
            io.emit('hasil_route','tidak_ada');
        }
    } else {
        io.emit('hasil_cek','salah');
    }
}
// end socket communication


let status_service          =       true;
io.on('connection', function(socket) {
    let file_route          =       kode.terjemaah(path_data+format_save);
    let file_route_json     =       JSON.parse(file_route);
    // console.log(file_route_json.length);
   
    for (let s = 0; s < file_route_json.length; s++) {
        
        socket.on(''+file_route_json[s].route+'', function(hasil) {
            let terjemaah_AES               =       kode.terjemaah_AES(hasil);
            let JSON_terjemaah              =       JSON.parse(terjemaah_AES);
            let cek_kridensial              =       JSON_terjemaah.kridensial;
            let kridensial_json             =       JSON.parse(cek_kridensial);

            if (kridensial_json.user == json_file.user && kridensial_json.password == json_file.password) {
                let token_link       =       JSON_terjemaah.token_links;
                let token            =       JSON_terjemaah.token;
                let koneksi     =       mysql_module.createConnection({
                    host:           kridensial_json.server,
                    user:           kridensial_json.user,
                    password:       kridensial_json.password,
                    database:       kridensial_json.database
                });
                koneksi.connect(function(pusing) {
                    if (pusing) {
                        io.emit('response_'+file_route_json[s].route+token_link,'Kesalahan kridensial => ' + pusing);
                    } else {
                        koneksi.query("SELECT * FROM token_penguna WHERE token = '"+token+"'", function(pusing, results_cek) {
                            if (pusing) {
                                io.emit('response_'+file_route_json[s].route+token_link,'Error Bagian query => ' +pusing);
                            } else {
                                if (results_cek.length >= 1) {
                                    koneksi.query(JSON_terjemaah.query, function(pusing, hasil_eksekusi) {
                                        if (pusing) {
                                            io.emit('response_'+file_route_json[s].route+token_link,'Kesalahan Query => ' + pusing);
                                        } else {
                                            let status      =   'transaksi_ok';
                                            let group       =    {
                                                status:     status,
                                                hasil:      hasil_eksekusi
                                            }
                                            let JSON_group          =    JSON.stringify(group);
                                            let enkrip_call_back    =    kode.enkripsi_AES(JSON_group);
                                            console.log('=============================================');
                                            console.log('====== Transaction Data IP '+JSON_terjemaah.ip_addr);
                                            console.log('=============================================');
                                            io.emit('response_'+file_route_json[s].route+token_link,enkrip_call_back);
                                        }
                                    });                                   
                                } else {
                                    let  status             =       'token tidak ada';
                                    let  json_data          =       JSON.stringify(status);
                                    let  enkripte           =       kode.enkripsi_AES(json_data);                
                                    io.emit('hasil_token'+token_link,enkripte);
                                }
                            }
                        });
                    }
                });
            } else {
                let token       =       JSON_terjemaah.token;
                io.emit('response_'+file_route_json[s].route+token,'mysql akses ditolak');
            }
        });

    }
    // authentification khusus untuk login penguna
    socket.on('auth', function(data) {
        let   terjemaah_data        =       kode.terjemaah_AES(data);
        let   JSON_terjemaah        =       JSON.parse(terjemaah_data);
        let   kridensial            =       JSON_terjemaah.kridensial;
        let   JSON_kridensial       =       JSON.parse(kridensial);
        let   token                 =       JSON_terjemaah.token;
        if (JSON_kridensial.user == json_file.user && JSON_kridensial.password == json_file.password) {
            let login               =       JSON_terjemaah;
            Login_Data(login);
        } else {
            io.emit('auth_response'+token,'kridensial salah');
        }
    });
    
    socket.on('cek_token', function(data) {
        let terjemaah           =       kode.terjemaah_AES(data);
        let terjemaah_json      =       JSON.parse(terjemaah);
        let token_cek           =       terjemaah_json.token_cek;
        let url_token           =       terjemaah_json.token_link;
        let cek_data            =       "SELECT * FROM token_penguna WHERE token = '"+token_cek+"'";
        database.database(cek_data, function(hasil) {
            if (hasil.length >= 1) {
                let  status             =       'token_ada';
                let  json_data          =       JSON.stringify(status);
                let  enkripte           =       kode.enkripsi_AES(json_data);
                io.emit('hasil_token'+url_token,enkripte);
            } else {
                let  status             =       'token tidak ada';
                let  json_data          =       JSON.stringify(status);
                let  enkripte           =       kode.enkripsi_AES(json_data);                
                io.emit('hasil_token'+url_token,enkripte);
            }
        });
    });

});

function  Login_Data(request_data) {
    let login        =      request_data.login;
    let token        =      request_data.token;

    let koneksi      =      mysql_module.createConnection({
        host:         json_file.server_ip,
        user:         json_file.user,
        password:     json_file.password,
        database:     json_file.database
    });

    koneksi.connect(function(pusing) {
        if (pusing) {
            io.emit('auth_response'+token,'Kesalahaan menghubungkan => '+ pusing);    
        } else {
            koneksi.query("SELECT * FROM penguna ", function(pusing,hasil) {
                if (pusing) {
                    io.emit('auth_response'+token,'Kesalahaan query => '+ pusing);   
                } else {
                    let data      =       [];
                    for (let o = 0; o < hasil.length; o++) {
                        let terjemaah_password   =   kode.terjemaah_AES(hasil[o].password);
                        data.push({email: hasil[o].email, password: terjemaah_password});
                    }
                    let request_password               =       login.password;
                    let terjemah_password              =       kode.terjemaah_AES(request_password);
                    let users_access                   =       data.find(data => { return data.email == login.email && data.password == terjemah_password; });
                    if (users_access == undefined) {
                        let json_text           =       JSON.stringify('user salah');
                        let enkripsi            =       kode.enkripsi_AES(json_text);
                        io.emit('auth_response'+token,enkripsi);
                    } else {
                        let email                      =       users_access.email;
                        koneksi.query("SELECT * FROM penguna WHERE email = '"+email+"'", function(pusing, hasil) {
                            if (pusing) {
                                console.log('Kesalahan Query => ' + pusing);
                            } else {
                                let ip_address          =       request_data.ip_addr;
                                let id                  =       hasil[0].id;
                                let nama                =       hasil[0].nama;
                                let password            =       hasil[0].password;
                                let data_token          =       nama+ password;
                                let token_user          =       kode.enkripsi_AES(data_token);
                                koneksi.query("SELECT * FROM token_penguna WHERE id_penguna = '"+id+"'", function(pusing, hasil_cek_id) {
                                    if (pusing) {
                                        console.log('kesalahan dari query => ' + pusing);
                                    } else {
                                        if (hasil_cek_id.length >= 1) {
                                            let delete_token        =    "DELETE FROM token_penguna WHERE id_penguna = '"+id+"'";
                                            koneksi.query(delete_token, function(pusing, terhapus) {
                                                if (pusing) {
                                                    console.log('Kesalahan Query => '+ pusing);
                                                    io.emit('auth_response'+token, 'erorr query => '+ pusing);
                                                } else {
                                                    const token_simpan      =    ora('loggin namanya => '+ nama);
                                                    koneksi.query("INSERT INTO token_penguna (token,id_penguna,nama,ip_address) VALUES ('"+token_user+"','"+id+"','"+nama+"','"+ip_address+"')", function (pusing,hasil) {
                                                        if (pusing) {
                                                            token_simpan.fail(['kesalahan query => ' + pusing]);
                                                            io.emit('auth_response'+token,'erorr query =>' + pusing);
                                                        } else {
                                                            koneksi.query("SELECT * FROM token_penguna WHERE id_penguna = '"+id+"'", function(pusing, hasil_cek) {
                                                                if (pusing) {
                                                                    io.emit('auth_response'+token,'erorr query => '+ pusing);
                                                                } else {
                                                                    let json_encode         =   JSON.stringify(hasil_cek);
                                                                    let enkrip_data         =   kode.enkripsi_AES(json_encode);
                                                                    io.emit('auth_response'+token,enkrip_data);                                                                    
                                                                }
                                                            });
                                                        }
                                                    });                                                   
                                                }
                                            });
                                        } else {
                                            const token_simpan      =    ora('loggin namanya => '+ nama);
                                            koneksi.query("INSERT INTO token_penguna (token,id_penguna,nama,ip_address) VALUES ('"+token_user+"','"+id+"','"+nama+"','"+ip_address+"')", function (pusing,hasil) {
                                                if (pusing) {
                                                    token_simpan.fail(['kesalahan query => ' + pusing]);
                                                    io.emit('auth_response'+ 'error query => ' + pusing);
                                                } else {
                                                    koneksi.query("SELECT * FROM token_penguna WHERE id_penguna = '"+id+"'", function(pusing, hasil_cek) {
                                                        if (pusing) {
                                                            io.emit('auth_response'+token,'erorr query => '+ pusing);
                                                        } else {
                                                            let json_encode         =   JSON.stringify(hasil_cek);
                                                            let enkrip_data         =   kode.enkripsi_AES(json_encode);
                                                            io.emit('auth_response'+token,enkrip_data);                                                                    
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    }
                                });
                                
                            }
                        });
                    }
                }
            });
        }
    });
}

let koneksi_io            =           'disconnect';
function Service() {
    if (status_service == false) {
        JalankanService();
        return ControllerServer(json_file);
    } else {
        console.log('===============================');
        console.log('===== Service sedang berjalan =');
        console.log('===============================');
        return ControllerServer(json_file);
    }
}

function JalankanService() {
    status_service              =    true;
    koneksi_io                  =    'connection';
}

function CekService(token) {

    let terjemaah_token         =    kode.komunikasi(token);
    if (fs.existsSync(path_token_save+terjemaah_token+format_save)) {
        let file_token              =        kode.terjemaah(path_token_save+terjemaah_token+format_save);
        if (terjemaah_token == file_token) {
            io.emit('hasil_status_route',status_service);
        } else {
            io.emit('hasil_cek','salah');
        }
    } else {
        io.emit('hasil_cek','salah');
    }
}