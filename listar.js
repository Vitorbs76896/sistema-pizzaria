<!DOCTYPE html>
<html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Lista de Usuários</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" 
            rel="stylesheet" 
            integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" 
            crossorigin="anonymous"
        >
    </head>
    <body>       
        <div class="container mt-5">
            <h1 class="text-center">Lista de Usuários</h1>

            <div id="mensagemErro" class="alert alert-danger d-none"></div>
            <div id="mensagemSucesso" class="alert alert-success d-none"></div>

            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Data de Criação</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody id="tabelaUsuarios">
                    <!-- Os usuários serão inseridos aqui via JavaScript -->
                </tbody>
            </table>

            <div class="container">
                <h2 id="welcomeMessage"></h2>
                <button id="logoutBtn" class="btn btn-success">Deslogar</button>
                <button id="dashboardBtn" class="btn btn-primary">Dashboard</button>
            </div>

            <div class="modal fade" id="visualizarUsuarioModal" tabindex="-1" aria-labelledby="visualizarUsuarioModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="visualizarUsuarioModalLabel">Detalhes do Usuário</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p><strong>Nome:</strong> <span id="usuarioNome"></span></p>
                            <p><strong>Email:</strong> <span id="usuarioEmail"></span></p>
                            <p><strong>Data de Criação:</strong> <span id="usuarioDataCriacao"></span></p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal fade" id="editarUsuarioModal" tabindex="-1" aria-labelledby="editarUsuarioModal" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="editarUsuarioModal">Editar Usuário</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p><strong>Nome:</strong> <input class="form-control" id="usuarioNomeForm"/></p>
                            <p><strong>Email:</strong> <input class="form-control" id="usuarioEmailForm"/></p>
                            <p><strong>Senha:</strong> <input type="password" class="form-control" id="usuarioSenhaForm"/></p>
                            <p><strong>Confirma Senha:</strong> <input type="password" class="form-control" id="usuarioConfirmaSenhaForm"/></p>
                        </div>
                        <div class="modal-footer">
                            <input type="hidden" id="usuarioCodigoForm"/>
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                            <button type="button" class="btn btn-success atualizar-usuario" data-bs-dismiss="modal">Atualizar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Scripts -->
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" 
            integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" 
            crossorigin="anonymous">
        </script>
        <script>
            document.getElementById('logoutBtn').addEventListener('click', function() {
                const token = localStorage.getItem('token');
                fetch('http://localhost:8000/api/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => {
                    if (response.ok) {
                        localStorage.clear();
                        window.location.href = 'login.html';
                    } else {
                        console.error('Erro ao deslogar');
                    }
                })
                .catch(error => {
                    console.error('Erro de rede ao tentar deslogar:', error);
                });
            });

            document.getElementById('dashboardBtn').addEventListener('click', function() {
                window.location.href = 'dashboard.html';
            });
        </script>

        <!-- Função para listar e manipular usuários -->
        <script>
            async function listarUsuarios() {
                const token = localStorage.getItem('token');
                const userIdLogado = localStorage.getItem('userId');

                try {
                    if (token) {
                        const response = await fetch('http://localhost:8000/api/user/listar', {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                        });            

                        if (response.ok) {
                            const usuarios = await response.json();
                            const tabelaUsuarios = document.getElementById('tabelaUsuarios');
                            tabelaUsuarios.innerHTML = '';

                            usuarios.user.data.forEach((usuario, index) => {
                                const dataCriacao = new Date(usuario.created_at);
                                const dataFormatada = dataCriacao.toLocaleString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                    hour12: false
                                });
                                const row = document.createElement('tr');
                                row.innerHTML = `
                                    <td>${index + 1}</td>
                                    <td>${usuario.name}</td>
                                    <td>${usuario.email}</td>
                                    <td>${dataFormatada}</td>
                                    <td>
                                        <button class="btn btn-info btn-sm visualizar-usuario" data-id="${usuario.id}">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="btn btn-info btn-sm editar-usuario" data-id="${usuario.id}">
                                            <i class="fas fa-pencil"></i>
                                        </button>
                                        ${
                                            usuario.id != userIdLogado
                                            ? `<button class="btn btn-danger btn-sm excluir-usuario" data-id="${usuario.id}">
                                                <i class="fas fa-trash-alt"></i>
                                               </button>`
                                            : ''
                                        }
                                    </td>
                                `;
                                tabelaUsuarios.appendChild(row);
                            });

                            document.querySelectorAll('.visualizar-usuario').forEach(button => {
                                button.addEventListener('click', function() {
                                    const userId = this.getAttribute('data-id');
                                    visualizarUsuario(userId);
                                });
                            });

                            document.querySelectorAll('.editar-usuario').forEach(button => {
                                button.addEventListener('click', function() {
                                    const userId = this.getAttribute('data-id');
                                    editarUsuario(userId);
                                });
                            });

                            document.querySelectorAll('.atualizar-usuario').forEach(button => {
                                button.addEventListener('click', function() {
                                    atualizarUsuario();
                                });
                            });

                        } else {
                            throw new Error('Erro ao buscar os usuários');
                        }
                    } else {
                        window.location.href = 'login.html';
                    }
                } catch (error) {
                    console.error('Erro:', error);
                    const mensagemErro = document.getElementById('mensagemErro');
                    mensagemErro.textContent = 'Erro ao carregar a lista de usuários';
                    mensagemErro.classList.remove('d-none');
                }
            }

            function visualizarUsuario(userId) {
                const token = localStorage.getItem('token');

                fetch(`http://localhost:8000/api/user/visualizar/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                })
                .then(response => response.json())
                .then(data => {        
                    if (data && data.user) {
                        document.getElementById('usuarioNome').textContent = data.user.name;
                        document.getElementById('usuarioEmail').textContent = data.user.email;

                        const dataCriacao = new Date(data.user.created_at);
                        document.getElementById('usuarioDataCriacao').textContent = dataCriacao.toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false
                        });

                        const visualizarModal = new bootstrap.Modal(document.getElementById('visualizarUsuarioModal'));
                        visualizarModal.show();
                    } else {
                        console.error('Usuário não encontrado');
                    }
                })
                .catch(error => {
                    console.error('Erro ao visualizar o usuário:', error);
                });
            }

            function editarUsuario(userId) {
                const token = localStorage.getItem('token');

                fetch(`http://localhost:8000/api/user/visualizar/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                })
                .then(response => response.json())
                .then(data => {        
                    if (data && data.user) {
                        document.getElementById('usuarioNomeForm').value = data.user.name;
                        document.getElementById('usuarioEmailForm').value = data.user.email;
                        document.getElementById('usuarioCodigoForm').value = data.user.id;

                        const editarModal = new bootstrap.Modal(document.getElementById('editarUsuarioModal'));
                        editarModal.show();
                    } else {
                        console.error('Usuário não encontrado para edição');
                    }
                })
                .catch(error => {
                    console.error('Erro ao editar o usuário:', error);
                });
            }

            function atualizarUsuario() {
                const token = localStorage.getItem('token');

                const userId = document.getElementById('usuarioCodigoForm').value; 
                const name = document.getElementById('usuarioNomeForm').value; 
                const email = document.getElementById('usuarioEmailForm').value; 
                const password = document.getElementById('usuarioSenhaForm').value; 
                const password_confirmation = document.getElementById('usuarioConfirmaSenhaForm').value; 

                fetch(`http://localhost:8000/api/user/atualizar/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({name, email, password, password_confirmation})
                })
                .then(response => response.json())
                .then(data => { 
                    if (data.success) {
                        const mensagemSucesso = document.getElementById('mensagemSucesso');
                        mensagemSucesso.textContent = data.message;
                        mensagemSucesso.classList.remove('d-none');       
                        listarUsuarios();
                    } else {
                        const mensagemErro = document.getElementById('mensagemErro');
                        mensagemErro.textContent = data.message || 'Erro ao atualizar o usuário';
                        mensagemErro.classList.remove('d-none');
                    }
                })
                .catch(error => {
                    console.error('Erro ao editar o usuário:', error);
                    const mensagemErro = document.getElementById('mensagemErro');
                    mensagemErro.textContent = 'Erro ao atualizar o usuário';
                    mensagemErro.classList.remove('d-none');
                });
            }

            // Chamar a função de listar usuários ao carregar a página
            window.onload = listarUsuarios;
        </script>
    </body>
</html>
