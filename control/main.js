var socket = io();
let token     =      localStorage.getItem('token');
let enkrip    =      btoa(token);
socket.emit('cek_token', enkrip);

socket.on('hasil_cek', function(hasil) {
    if (hasil == 'betul') {
        $('.loading').css('display','none');
    } else {
        localStorage.clear();
        let enkrip      =       btoa(token);
        socket.emit('hapus_token',enkrip);
        setTimeout(() => {
            window.location.href        =      '/';
        }, 800); 
    }
});

// function setRoute() {
//     let namaKomunikasi          =       $('#nama_komunikasi').val();
//     if (namaKomunikasi.length <= 0) {
//         $('#route').notify('Nama komunikasi tidak boleh kosong','info');
//     } else {
        
//     }
// }

let counter             =       0;

function addRoute() {
    counter++;
    $('.push_route').before('<div class="list"><input type="text" id="route'+counter+'" class="form-control" placeholder="Route"></div>');
}

function setRoute() {
    let form           =         [];
    for (let i = 1; i <= counter; i++) {
        let Route            =                $('#route'+[i]).val();
        if (Route.length <= 0) {
            $('#route'+[i]).notify('Route tidak boleh kosong','warn');
        } else {
            form.push({route: Route});
        }
    }
    let json_data      =        JSON.stringify(form);
    // console.log(counter+ ' < '+ form.length);

    if (form.length < counter) {
        $.notify('Isi route kosong','info');
    } else {
        let enkripdata              =        btoa(json_data);
        let data_send  =        {
            data:       enkripdata,
            token:      enkrip
        };
        let json_data_send          =       JSON.stringify(data_send);
        let data_send_enkrip        =       btoa(json_data_send);
        socket.emit('route',data_send_enkrip);
        window.location.href        =       '/control';
    }
}
socket.on('status__route', function(hasil) {
    if (hasil == 'sukses') {
        RequestRoute();
    } else {
        swal({
            title: 'Gagal Menyimpan Route !',
            icon:  'damger'
        });
    }
});

function RequestRoute() {
    socket.emit('list_route', enkrip);
}

socket.emit('list_route',enkrip);
let data_routes         =       [];
socket.on('hasil_route', function(data) {
    $('.loading').css('display','block');
    if (data == 'tidak_ada') {
        $('.loading').css('display','none');
        $('#addRouteEdit').css('display','none');
        $('#unsetRoute').css('display','none');
        $('#addEditRoute').css('display','none');
        $('#SetRouteEdit').css('display','none');
    } else {
        let tjmaah          =      atob(data);
        $('.loading').css('display','none');
        let json_data       =      JSON.parse(tjmaah);
        
        $('#addRoute').css('display','none');
        $('#setRoute').css('display','none');
        
        for (let i = 0; i < json_data.length; i++) {
            data_routes.push({route: json_data[i].route});
            $('.push_route').before('<div class="list"><input type="text" id="route'+[i]+'" class="form-control" placeholder="Route" value="'+json_data[i].route+'"></div>');
        }
    }
});

function leng_json() {
    return data_routes.length++;
}

function AddRoutes() {
    let d           =     leng_json();
    $('.push_route').before('<div class="list"><input type="text" id="route'+d+'" class="form-control" placeholder="Route"></div>');
    
}

function setRouteEdit() {
    let form_edit        =          [];
    for (let i = 0; i < data_routes.length; i++) {
        if ($('#route'+[i]).val().length <= 0) {
            $('#route'+[i]).notify('Route harus di isi','info');
        } else {
            form_edit.push({route: $('#route'+[i]).val()});
        }
    }
    
    if (form_edit.length < data_routes.length) {
        $.notify('Isi input yang kosong ','info');
    } else {
        let json_form_edit          =       JSON.stringify(form_edit);
        let enkrip_json_form        =       btoa(json_form_edit);
        let data_send               =       {
            data:       enkrip_json_form,
            token:      enkrip
        }
        let json_data_send          =       JSON.stringify(data_send);
        let enkrip_send             =       btoa(json_data_send);
        socket.emit('route', enkrip_send);
        window.location.href        =       '/control';
    }
}

function UnsetRoute() {
    socket.emit('unset_route', enkrip);
}


socket.on('unset_route_status', function(hasil) {
    if (hasil == 'berhasil') {
        swal({
            title:      'Route sudah dihapus',
            icon:       'success',
            buttons:  true
        });
        setTimeout(() => {
            window.location.href        =   '/control';
        }, 1000);
    } else {
        swal({
            title:      'Gagal Menghapus Route !',
            icon:       'danger',
            buttons:    true
        });
    }
});

socket.emit('status_service',enkrip);

socket.on('hasil_status_route', function(hasil) {
    if (hasil == true) {
        $('.status_layanan').append('<span class="badge badge-success">Jalan</span>');
    } else {
        $('.status_layanan').append('<span class="badge badge-danger">Tidak berjalan</span>');
    }
});
// socket.emit('pertama','pertama');