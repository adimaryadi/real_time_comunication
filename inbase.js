var inbase           =   require('express')();
var server           =   require('http').Server(inbase);
const fs             =   require('fs');
const file           =   require('./alat/bacafile');
const kode           =   require('./alat/enkripsi');
const { spawn }      =   require('child_process');
const readline       =   require('readline');
const detect_port    =   require('detect-port');
var mysql            =   require('mysql');
const rl             =   readline.createInterface({
    input:      process.stdin,
    output:     process.stdout,
    prompt:     'Perintah INBASE :'
});
var io               =   require('socket.io')(server);
var token            =   require('token');
token.defaults.secret = 'inbase';
token.defaults.timeStep = 10 * 30 * 60;
var localStorage      =  require('localStorage');
 
rl.prompt();

rl.on('line', (line) => {
    switch(line.trim()) {
        case 'jalankan':
        jalankan();
        break;
        case 'berhenti': 
        console.log('Server INBASE berhenti');
        process.exit(0);       
        break;

        default:
        console.log('Perintah tidak ditemukan ' + line.trim());
    }
    rl.prompt();
});

let path           =   'config/user';
let pathread       =   '.inbase';

if (fs.existsSync('config/user.inbase')) {
    Akses_user();
}  else {
    inbase.get('/', function(req, res) {              
        res.sendFile(__dirname + '/frontend/config/index.html');
    });
    inbase.get('/style', function(req,res) {
        res.sendFile(__dirname + '/frontend/config/index.css');
    });
    inbase.get('/config', function(req, res) {
        res.sendFile(__dirname + '/frontend/config/index.js');
    });
    inbase.get('/jquery', function(req, res) {
        res.sendFile(__dirname + '/frontend/config/jquery-3.3.1.js');
    });
    inbase.get('/swetalert2', function(req, res) {
        res.sendFile(__dirname + '/frontend/config/sweetalert2.js');
    });
    inbase.post('/simpan_config/:data', function(req,res) {
        Simpan(req.params);
        res.redirect('/');
    });
}

function Akses_user() {
    let user_akses      =    kode.terjemaah(path + pathread);
    let password        =    user_akses.password;
    if (password == '') { 
      jalankan();             
      Admin();
      let user_file   =    kode.terjemaah(path + pathread);
      var data_token      =   token.generate(user_file.user+user_file.password);
      var token_path      =   'config/token';
      let save            =   kode.enkrip(data_token, token_path);
      io.on('connection', function(socket) {
        socket.on('token_r', function(hasil) {
            io.emit('token', data_token);
        });
      });
      console.log('=============== Password Kosong =================');
      rl.prompt();
      inbase.get('/', function(req,res) {
          res.sendFile(__dirname + '/frontend/inbase/auth.html');
      });
      console.log('======= token ' + data_token + ' ======');  
      console.log('=======================================');
      rl.prompt();  
    } else {
        inbase.get('/', function (req, res) {
            res.sendFile(__dirname + '/frontend/login/login.html');
        });
        inbase.get('/login-style', function (req, res) {
            res.sendFile(__dirname + '/frontend/login/login.css');
        });
        inbase.get('/login-js', function (req, res) {
            res.sendFile(__dirname + '/frontend/login/login.js');
        });
        inbase.get('/notify', function(req, res) {
            res.sendFile(__dirname + '/frontend/source_style/notify.js');
        });
        inbase.get('/jquery', function(req, res) {
            res.sendFile(__dirname + '/frontend/source_style/jquery-3.3.1.js');
        });
        inbase.get('/sweetalert', function(req, res) {
            res.sendFile(__dirname + '/frontend/source_style/sweetalert2.js');
        });
        inbase.get('/vendor/bootstrap/css/bootstrap.min.css', function(req, res) {
            res.sendFile(__dirname + '/frontend/source_style/login/vendor/bootstrap/css/bootstrap.min.css');
        });
        inbase.get('/fonts/font-awesome-4.7.0/css/font-awesome.min.css', function(req, res) {
            res.sendFile(__dirname + '/frontend/source_style/login/fonts/font-awesome-4.7.0/css/font-awesome.min.css');
        });
        inbase.get('/fonts/iconic/css/material-design-iconic-font.min.css', function(req, res) {
            res.sendFile(__dirname + '/frontend/source_style/login/fonts/iconic/css/material-design-iconic-font.min.css');
        });
        inbase.get('/vendor/animate/animate.css', function(req, res) {
            res.sendFile(__dirname + '/frontend/source_style/login/vendor/animate/animate.css');
        });
        inbase.get('/vendor/css-hamburgers/hamburgers.min.css', function(req, res) {
            res.sendFile(__dirname + '/frontend/source_style/login/vendor/css-hamburgers/hamburgers.min.css');
        });
        inbase.get('/fonts/Linearicons-Free-v1.0.0/icon-font.min.css', function(req, res) {
            res.sendFile(__dirname + '/frontend/source_style/login/fonts/Linearicons-Free-v1.0.0/icon-font.min.css');
        });
        inbase.get('/vendor/animsition/css/animsition.min.css', function(req, res) {
            res.sendFile(__dirname + '/frontend/source_style/login/vendor/animsition/css/animsition.min.css');
        });
        inbase.get('/vendor/select2/select2.min.css', function(req, res) {
            res.sendFile(__dirname + '/frontend/source_style/login/vendor/select2/select2.min.css');
        });
        inbase.get('/vendor/daterangepicker/daterangepicker.css', function(req, res) {
            res.sendFile(__dirname + '/frontend/source_style/login/vendor/daterangepicker/daterangepicker.css');
        });
        inbase.get('/css/util.css', function(req, res) {
            res.sendFile(__dirname + '/frontend/source_style/login/css/util.css');
        });
        inbase.get('/css/main.css', function(req, res) {
            res.sendFile(__dirname + '/frontend/source_style/login/css/main.css');
        });
        inbase.get('/vendor/jquery/jquery-3.2.1.min.js', function(req, res) {
            res.sendFile(__dirname + '/frontend/source_style/login/vendor/jquery/jquery-3.2.1.min.js');
        });
        inbase.get('/vendor/animsition/js/animsition.min.js', function(req, res) {
            res.sendFile(__dirname + '/frontend/source_style/login/vendor/animsition/js/animsition.min.js');
        });
        inbase.get('/vendor/bootstrap/js/popper.js', function(req, res) {
            res.sendFile(__dirname + '/frontend/source_style/login/vendor/bootstrap/js/popper.js');
        });
        inbase.get('/vendor/bootstrap/js/bootstrap.min.js', function(req, res) {
            res.sendFile(__dirname + '/frontend/source_style/login/vendor/bootstrap/js/bootstrap.min.js');
        });
        inbase.get('/vendor/select2/select2.min.js', function(req, res) {
            res.sendFile(__dirname + '/frontend/source_style/login/vendor/select2/select2.min.js');
        });
        inbase.get('/vendor/daterangepicker/moment.min.js', function(req, res) {
            res.sendFile(__dirname + '/frontend/source_style/login/vendor/daterangepicker/moment.min.js');
        });
        inbase.get('/vendor/daterangepicker/daterangepicker.js', function(req, res) {
            res.sendFile(__dirname + '/frontend/source_style/login/vendor/daterangepicker/daterangepicker.js');
        });
        inbase.get('/vendor/countdowntime/countdowntime.js', function(req, res) {
            res.sendFile(__dirname + '/frontend/source_style/login/vendor/countdowntime/countdowntime.js');
        });
        inbase.get('/js/main.js', function(req, res) {
            res.sendFile(__dirname + '/frontend/source_style/login/js/main.js');
        });
        inbase.get('/fonts/font-awesome-4.7.0/fonts/fontawesome-webfont.ttf', function(req, res) {
            res.sendFile(__dirname + '/frontend/source_style/login/fonts/font-awesome-4.7.0/fonts/fontawesome-webfont.ttf');
        });
        inbase.get('/fonts/font-awesome-4.7.0/fonts/fontawesome-webfont.woff', function(req, res) {
            res.sendFile(__dirname + '/frontend/source_style/login/fonts/font-awesome-4.7.0/fonts/fontawesome-webfont.woff');
        });
        inbase.get('/fonts/iconic/fonts/Material-Design-Iconic-Font.ttf', function(req, res) {
            res.sendFile(__dirname + '/frontend/source_style/login/fonts/iconic/fonts/Material-Design-Iconic-Font.ttf');
        });
        inbase.get('/fonts/poppins/Poppins-Bold.ttf', function(req, res) {
            res.sendFile(__dirname + '/frontend/source_style/login/fonts/poppins/Poppins-Bold.ttf');
        });
        inbase.get('/images/bg-01.jpg', function(req, res) {
            res.sendFile(__dirname + '/frontend/source_style/login/images/bg-01.jpg');
        });
        inbase.get('/fonts/poppins/Poppins-SemiBold.ttf', function(req, res) {
            res.sendFile(__dirname + '/frontend/source_style/login/fonts/poppins/Poppins-SemiBold.ttf');
        });
        inbase.get('/fonts/poppins/Poppins-Regular.ttf', function(req, res) {
            res.sendFile(__dirname + '/frontend/source_style/login/fonts/poppins/Poppins-Regular.ttf');
        });
        inbase.get('/fonts/poppins/Poppins-Medium.ttf', function(req, res) {
            res.sendFile(__dirname + '/frontend/source_style/login/fonts/poppins/Poppins-Medium.ttf');
        });
    }
}
var  dip    =       '';
io.on('connection', function(socket) {
    socket.on('login', function(hasil) {
        let login_terjemaah      =   kode.komunikasi(hasil);
        let datajson             =   JSON.parse(login_terjemaah);
        Login(datajson);
    });
    socket.on('ip', function(ip) {
        dip       =     ip;
    });
});


function Login(login) {
    let user_file   =    kode.terjemaah(path + pathread);
    console.log(dip);
    if (login.user == user_file.user && login.password == user_file.password) {
        io.emit('cek','betul');
        var data_token      =   token.generate(user_file.user+user_file.password);
        var token_path      =   'config/token';
        let save            =   kode.enkrip(data_token, token_path);
        console.log('=============== login =================');
        io.emit('token', data_token);
        console.log('======= token ' + data_token + '=======');
        console.log(dip);
        console.log('=======================================');
        Admin();
    } else {
        io.emit('cek','salah');
    }
}

function Admin() {
    inbase.get('/inbase', function(req,res) {
        res.sendFile(__dirname + '/frontend/inbase/index.html');
    });
    inbase.get('/css/bootstrap.min.css', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/css/bootstrap.min.css');
    });
    inbase.get('/css/font-awesome.min.css', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/css/font-awesome.min.css');
    });
    inbase.get('/css/owl.carousel.css', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/css/owl.carousel.css');
    });
    inbase.get('/css/owl.carousel.css', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/css/owl.carousel.css');
    });
    inbase.get('/css/owl.theme.css', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/css/owl.theme.css');
    });
    inbase.get('/css/owl.transitions.css', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/css/owl.transitions.css');
    });
    inbase.get('/fonts/notika-icon.ttf', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/fonts/notika-icon.ttf');
    });
    inbase.get('/fonts/fontawesome-webfont.woff2', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/fonts/fontawesome-webfont.woff2');
    });
    inbase.get('/css/animate.css', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/css/animate.css');
    });
    inbase.get('/css/fonts/notika-icon.woff?qzfrsz', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/css/fonts/notika-icon.woff?qzfrsz');
    });
    inbase.get('/fonts/fontawesome-webfont.woff2?v=4.5.0', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/fonts/fontawesome-webfont.woff2?v=4.5.0');
    });
    inbase.get('/fonts/fontawesome-webfont.woff?v=4.5.0', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/fonts/fontawesome-webfont.woff?v=4.5.0');
    });
    inbase.get('/fonts/fontawesome-webfont.ttf?v=4.5.0', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/fonts/fontawesome-webfont.ttf?v=4.5.0');
    });
    inbase.get('/css/normalize.css', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/css/normalize.css');
    });
    inbase.get('/css/scrollbar/jquery.mCustomScrollbar.min.css', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/css/scrollbar/jquery.mCustomScrollbar.min.css');
    });
    inbase.get('/css/jvectormap/jquery-jvectormap-2.0.3.css', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/css/jvectormap/jquery-jvectormap-2.0.3.css');
    });
    inbase.get('/css/notika-custom-icon.css', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/css/notika-custom-icon.css');
    });
    inbase.get('/css/wave/waves.min.css', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/css/wave/waves.min.css');
    });
    inbase.get('/css/bootstrap-select/bootstrap-select.css', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/css/bootstrap-select/bootstrap-select.css');
    });
    inbase.get('/css/main.css', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/css/main.css');
    });
    inbase.get('/style.css', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/style.css');
    });
    inbase.get('/css/responsive.css', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/css/responsive.css');
    });
    inbase.get('/css/meanmenu/meanmenu.min.css', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/css/meanmenu/meanmenu.min.css');
    });
    inbase.get('/js/vendor/modernizr-2.8.3.min.js', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/js/vendor/modernizr-2.8.3.min.js');
    });
    inbase.get('/js/vendor/jquery-1.12.4.min.js', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/js/vendor/jquery-1.12.4.min.js');
    });
    inbase.get('/js/bootstrap.min.js', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/js/bootstrap.min.js');
    });
    inbase.get('/js/wow.min.js', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/js/wow.min.js');
    });
    inbase.get('/sweetalert', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/js/sweetalert.min.js');
    });
    inbase.get('/js/jquery-price-slider.js', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/js/jquery-price-slider.js');
    });
    inbase.get('/js/owl.carousel.min.js', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/js/owl.carousel.min.js');
    });
    inbase.get('/js/jquery.scrollUp.min.js', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/js/jquery.scrollUp.min.js');
    });
    inbase.get('/js/jquery.scrollUp.min.js', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/js/jquery.scrollUp.min.js');
    });
    inbase.get('/js/counterup/jquery.counterup.min.js', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/js/counterup/jquery.counterup.min.js');
    });
    inbase.get('/js/counterup/waypoints.min.js', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/js/counterup/waypoints.min.js');
    });
    inbase.get('/js/counterup/counterup-active.js', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/js/counterup/counterup-active.js');
    });
    inbase.get('/js/scrollbar/jquery.mCustomScrollbar.concat.min.js', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/js/scrollbar/jquery.mCustomScrollbar.concat.min.js');
    });
    inbase.get('/js/jvectormap/jquery-jvectormap-2.0.2.min.js', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/js/jvectormap/jquery-jvectormap-2.0.2.min.js');
    });
    inbase.get('/js/jvectormap/jquery-jvectormap-world-mill-en.js', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/js/jvectormap/jquery-jvectormap-world-mill-en.js');
    });
    inbase.get('/js/jvectormap/jvectormap-active.js', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/js/jvectormap/jvectormap-active.js');
    });
    inbase.get('/js/sparkline/jquery.sparkline.min.js', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/js/sparkline/jquery.sparkline.min.js');
    });
    inbase.get('/js/sparkline/sparkline-active.js', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/js/sparkline/sparkline-active.js');
    });
    inbase.get('/js/flot/jquery.flot.js', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/js/flot/jquery.flot.js');
    });
    inbase.get('/js/flot/jquery.flot.resize.js', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/js/flot/jquery.flot.resize.js');
    });
    inbase.get('/js/flot/curvedLines.js', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/js/flot/curvedLines.js');
    });
    inbase.get('/js/flot/flot-active.js', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/js/flot/flot-active.js');
    });
    inbase.get('/js/knob/jquery.knob.js', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/js/knob/jquery.knob.js');
    });
    inbase.get('/js/knob/jquery.appear.js', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/js/knob/jquery.appear.js');
    });
    inbase.get('/js/knob/knob-active.js', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/js/knob/knob-active.js');
    });
    inbase.get('/js/wave/waves.min.js', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/js/wave/waves.min.js');
    });
    inbase.get('/js/wave/wave-active.js', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/js/wave/wave-active.js');
    });
    inbase.get('/js/todo/jquery.todo.js', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/js/todo/jquery.todo.js');
    });
    inbase.get('/js/plugins.js', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/js/plugins.js');
    });
    inbase.get('/js/chat/moment.min.js', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/js/chat/moment.min.js');
    });
    inbase.get('/js/chat/jquery.chat.js', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/js/chat/jquery.chat.js');
    });
    inbase.get('/js/main.js', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/js/main.js');
    });
    inbase.get('/js/tawk-chat.js', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/js/tawk-chat.js');
    });
    inbase.get('/js/bootstrap-select/bootstrap-select.js', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/js/bootstrap-select/bootstrap-select.js');
    });
    inbase.get('/images/select.png', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/images/select.png');
    });
    inbase.get('/js/notify.js', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/js/notify.js');
    });
    inbase.get('/js/meanmenu/jquery.meanmenu.js', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/js/meanmenu/jquery.meanmenu.js');
    });
    inbase.get('/img/logo/logo.png', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/img/logo/logo.png');
    });
    inbase.get('/img/post/1.jpg', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/img/post/1.jpg');
    });
    inbase.get('/img/post/2.jpg', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/img/post/2.jpg');
    });
    inbase.get('/img/post/4.jpg', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/img/post/4.jpg');
    });
    inbase.get('/img/country/1.png', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/img/country/1.png');
    });
    inbase.get('/img/country/2.png', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/img/country/2.png');
    });
    inbase.get('/img/country/3.png', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/img/country/3.png');
    });
    inbase.get('/img/country/3.png', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/admin/img/country/3.png');
    });
    inbase.get('/js/inbase.js', function(req,res) {
        res.sendFile(__dirname + '/frontend/inbase/inbase.js');
    });
    inbase.get('/inbase.css', function(req,res) {
        res.sendFile(__dirname + '/frontend/inbase/index.css');
    });
    inbase.get('/img/favicon.ico', function(req,res) {
        res.sendFile(__dirname + '/frontend/source_style/inbase.ico');
    });
}

io.on('connection', function (socket) {
    socket.on('info', function(status) {
        console.log('========================================================');
        console.log('======== System autologout kecurigaan akses Server =====');
        console.log('==== system curiga dengan ip '+ dip + ' ================');
        console.log('========================================================');
        console.log('========================================================');
    });
});

io.on('connection', function(socket) {
    socket.on('cek_token', function(cek_token) {
        let baca_file_token      =      kode.terjemaah('config/token'+ pathread);
        if (cek_token == baca_file_token) {
            io.emit('hasil_cek', 'betul');   
        } else {
            io.emit('hasil_cek', 'salah'); 
            socket.on('ip', function(ipdetect) {
                console.log('=================================================================');
                console.log('========= System Peringatan Kecuringaan akses tampa izin ========');
                console.log('========= IP ' + ipdetect+ ' ====================================');
                console.log('================= hacker berusaha meretas database ==============');
                console.log('===== block ip tersebut upaya pencegahan pengambilan data =======');
                console.log('=================================================================');
                console.log('=================================================================');
            });
        }
    });
});



// membuat database 
// path read definisi = .inbase
var databasepath            =       'sistem/database/';
io.on('connection', function(socket) {
    socket.on('listfiledb', function(datadb) {
        var    token        =      kode.terjemaah('config/token' + pathread);
        if (token == datadb) {
            fs.readdir(databasepath, (pusing, files) => {
                var filedbe      =       [];
                files.forEach(file => {
                    var remove_f    =   file.replace('.inbase','');
                    filedbe.push(remove_f);
                    return;
                });
                var  jsonfilede     =     JSON.stringify(filedbe);
                var enkripfiledb    =     kode.enkripkomunikasi(jsonfilede);
                io.emit('listdb', enkripfiledb);
            });             
        }
    });
});
 
io.on('connection', function(socket) {
    socket.on('buatdatabase', function(data) {
        var database             =      kode.komunikasi(data);
        var dbjson               =      JSON.parse(database);
        var token                =       dbjson.token;
        let baca_file_token      =       kode.terjemaah('config/token'+ pathread);
        if (token == baca_file_token) {
            var  dtsimpan          =       {
                namadb:         dbjson.database,
                daftar_tabel:   []
            }
            if (fs.existsSync(databasepath + dbjson.database + pathread)) {
                io.emit('statusdb','ada');
                console.log('===============================================');
                console.log('== data base sudah ada ' + dbjson.database+ ' =');
                console.log('===============================================');
            } else {
                io.emit('statusdb','tidak');
                console.log('===============================================');
                console.log('===============================================');
                setTimeout(() => {
                    fs.readdir(databasepath, (pusing, files) => {
                        var filedbe      =       [];
                        files.forEach(file => {
                            var remove_f    =   file.replace('.inbase','');
                            filedbe.push(remove_f);
                            return;
                        });
                        var  jsonfilede     =     JSON.stringify(filedbe);
                        var enkripfiledb    =     kode.enkripkomunikasi(jsonfilede);
                        io.emit('datadb', enkripfiledb);
                    });                     
                }, 2000);
                console.log('===============================================');
                console.log('====== database tersimpan =====================');
                console.log('====== '+ dbjson.database + ' =================');
                console.log('===============================================');
            kode.enkrip(dtsimpan, databasepath + dbjson.database);                
            }
        } else {
            io.emit('akses','akses_ditolak');
        }
    });
});

// EOF


// hapus database 
io.on('connection', function(socket) {
    socket.on('hapusdb', function(hapusdb) {
        let hapusd_de            =    kode.komunikasi(hapusdb);
        let hapusd_j             =    JSON.parse(hapusd_de);
        let token_r              =    hapusd_j.token;
        let baca_file_token      =      kode.terjemaah('config/token'+ pathread);
        if (token_r == baca_file_token) {
            let dbhapus          =      hapusd_j.dbhapus;
            let dh               =      kode.hapusfile(databasepath + dbhapus + pathread);
            io.emit('statusdbd','terhapus');
        } else {
            io.emit('hasil_cek');
        }
    });
});
// EOF hapus database

// simpan tabel
io.on('connection', function(socket) {
    socket.on('daftar_tabel', function(database) {
        let baca_file         =       kode.terjemaah(databasepath + database + pathread);
        let datajson          =       JSON.stringify(baca_file);
        let encode_file       =       kode.enkripkomunikasi(datajson);
        io.emit('file_db', encode_file);
    });
    socket.on('tabel_simpan', function(data) {
        let terjemaah         =      kode.komunikasi(data);
        let jsondata          =      JSON.parse(terjemaah);
        let baca_token        =      kode.terjemaah('config/token'+pathread);
        if (jsondata.token == baca_token) {
            let database      =      jsondata.database;
            let dbaca         =      databasepath + database + pathread;
            let datadb        =      kode.terjemaah(dbaca);
            let nmdb          =      datadb.namadb;
            let tabel         =      jsondata.tabel;
            let kolom         =      jsondata.kolom;
            let kolom_json    =      JSON.stringify(kolom);
            let tabel_data    =      {tabel: tabel, kolom: kolom_json};
            const cari_tabel   =   datadb.daftar_tabel.find(data => data.tabel === tabel);

            if (cari_tabel == undefined) {
                datadb.daftar_tabel.push(tabel_data);
                kode.enkrip(datadb, databasepath + database);
                console.log('==========================================');
                console.log('========== tabel tersimpan '+ tabel+ '====');
                console.log('==========================================');
                console.log('==========================================');
                io.emit('tabel_status','tersimpan');
            } else {
                console.log('==========================================');
                console.log('========== tabel '+tabel+' sudah ada =====');
                console.log('==========================================');
                console.log('==========================================');
                console.log('==========================================');
                io.emit('tabel_status','tabel_ada');
            }
            
            
        } else {
            io.emit('hasil_cek','salah');
        }
    });
});
// EOF tabel

function Simpan(param) {
    let data        =   param;
    let user        =   JSON.parse(data.data)[0].user;
    let password    =   JSON.parse(data.data)[0].password;
    let port        =   JSON.parse(data.data)[0].port;
    
    let form        =   {
        user:           user,
        password:       password,
        port:           port
    }
    let en          =   kode.enkrip(form, path);
    console.log('===============================');
    console.log('====== config Tersimpan  ======');
    console.log('===============================');
    console.log('=== jalan kembali systemnya ===');
    console.log('===============================');
    process.exit(0);
}    


function jalankan() {
    if (fs.existsSync(path + pathread)) {
        var konfig_user     =   kode.terjemaah(path + pathread);
        var port            =   konfig_user.port;
        console.log(port);
        detect_port(port, (pusing, _port) => {
            if(pusing) {
                console.log(pusing);
            }

            if (port == _port) {
                server.listen(port, function() {
                    console.log('=====================================================');
                    console.log('=====================================================');
                    console.log('========= inbase berjalan akses port : '+port+' =====');
                    console.log('=====================================================');
                    console.log('=====================================================');
                });
            } else {
                console.log(' Server Sedang Berjalan ');
                rl.prompt();
            }
        });
    } else {
        detect_port(5200, (pusing, _port) => {
            if(pusing) {
                console.log(pusing);
            }

            if (5200 == _port) {
                server.listen(5200, function() {
                    console.log('=====================================================');
                    console.log('=====================================================');
                    console.log('========= inbase berjalan akses port default : 5200 =');
                    console.log('=====================================================');
                    console.log('=====================================================');
                });
            } else {
                console.log(' Server Sedang Berjalan ');
                rl.prompt();
            }  
        });     
    }
}