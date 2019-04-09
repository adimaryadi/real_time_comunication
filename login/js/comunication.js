var socket = io();
$('#login').click(function() {
    var ip_detect       =   [];
    var ip              =   $.getJSON('http://ip-api.com/json', function() {})
    .done(function(data) {
       socket.emit('ip_request',data.query);
    });
    
    let nama            =   $('#nama').val();
    let password        =   $('#password').val();

    if (nama.length <= 0) {
        $.notify('Nama Tidak boleh kosong','info');
        $.notify('Password tidak boleh kosong','info');
    } else {
        login           =   {
            user:       nama,
            password:   password
        }
        let json_login  =   JSON.stringify(login);
        let enkrip      =   btoa(json_login);
        socket.emit('login',enkrip);
    }
});

let token        =         localStorage.getItem('token');
if (token == null) {

} else {
    cekToken(token);
}

// response server
socket.on('login_status', function(data) {
    let terjemaah    =     atob(data);
    if (terjemaah == 'salah') {
        swal({
            title: 'akses ditolak !',
            icon:  'warning'
        });
    } else {
        swal({
            title: 'akses diterima',
            icon:  'success'
        });
        socket.on('token', function(token) {
            localStorage.setItem('token', token);
        });
        setTimeout(() => {
            window.location.href        =        '/control';
        }, 1000);
    }
});
// end response server

function cekToken(token) {
    let enkrip          =       btoa(token);
    socket.emit('cek_token',enkrip);
}

socket.on('hasil_cek', function(hasil) {
    if (hasil == 'betul') {
        window.location.href        =        '/control';
    } else {
        window.location.href        =        '/';
        localStorage.clear();
    }
});