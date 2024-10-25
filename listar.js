<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lista de Usuários</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" 
          rel="stylesheet" 
          integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" 
          crossorigin="anonymous">
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
    </div>

    <!-- Modais para Visualizar e Editar Usuário -->
    <!-- Código dos modais continua igual -->

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" 
            integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" 
            crossorigin="anonymous"></script>
    
    <script>
        // Botão de logout e redirecionamento para o dashboard
        document.getElementById('logoutBtn').addEventListener('click', logout);
        document.getElementById('dashboardBtn').addEventListener('click', () => window.location.href = 'dashboard.html');
        
        // Função de listagem de usuários ao carregar a página
        window.onload = listarUsuarios;

        // SRP: Função para listar usuários e delegar a renderização
        async function listarUsuarios() {
            try {
                const usuarios = await fetchData('user/listar');
                renderizarUsuarios(usuarios);
            } catch (error) {
                console.error('Erro ao carregar usuários:', error);
                exibirMensagem('mensagemErro', 'Erro ao carregar a lista de usuários');
            }
        }

        // SRP: Visualizar detalhes do usuário
        function visualizarUsuario(userId) {
            fetchData(`user/visualizar/${userId}`).then(usuario => {
                if (usuario) abrirVisualizacaoModal(usuario);
            }).catch(error => console.error('Erro ao visualizar o usuário:', error));
        }

        // SRP: Editar dados do usuário
        function editarUsuario(userId) {
            fetchData(`user/visualizar/${userId}`).then(usuario => {
                if (usuario) abrirEditarModal(usuario);
            }).catch(error => console.error('Erro ao editar o usuário:', error));
        }

        // SRP e OCP: Atualizar dados do usuário
        function atualizarUsuario() {
            const userId = document.getElementById('usuarioCodigoForm').value;
            const data = obterDadosUsuario();
            
            fetchData(`user/atualizar/${userId}`, 'PUT', data)
                .then(response => {
                    if (response.success) {
                        exibirMensagem('mensagemSucesso', response.message);
                        listarUsuarios();
                    }
                })
                .catch(error => console.error('Erro ao atualizar o usuário:', error));
        }

        // DIP: Função para deslogar o usuário
        function logout() {
            fetchData('logout', 'POST').then(() => {
                localStorage.clear();
                window.location.href = 'login.html';
            }).catch(error => console.error('Erro ao deslogar:', error));
        }

        // DIP: Função genérica para comunicação com backend
        async function fetchData(endpoint, method = 'GET', data = null) {
            const token = localStorage.getItem('token');
            const options = {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            };
            if (data) options.body = JSON.stringify(data);

            const response = await fetch(`http://localhost:8000/api/${endpoint}`, options);
            if (!response.ok) throw new Error('Erro na resposta');
            return response.json();
        }

        // SRP: Exibir mensagem de erro ou sucesso
        function exibirMensagem(elementId, message) {
            const element = document.getElementById(elementId);
            element.textContent = message;
            element.classList.remove('d-none');
        }

        // SRP: Renderizar usuários na tabela
        function renderizarUsuarios(usuarios) {
            const tabelaUsuarios = document.getElementById('tabelaUsuarios');
            tabelaUsuarios.innerHTML = '';
            usuarios.user.data.forEach((usuario, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${usuario.name}</td>
                    <td>${usuario.email}</td>
                    <td>${formatarData(usuario.created_at)}</td>
                    <td>
                        <button class="btn btn-info btn-sm" onclick="visualizarUsuario(${usuario.id})">Visualizar</button>
                        <button class="btn btn-info btn-sm" onclick="editarUsuario(${usuario.id})">Editar</button>
                    </td>`;
                tabelaUsuarios.appendChild(row);
            });
        }

        // SRP: Formatar data para exibição
        function formatarData(dataStr) {
            const data = new Date(dataStr);
            return data.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
        }

        // SRP: Obter dados do formulário de usuário
        function obterDadosUsuario() {
            return {
                name: document.getElementById('usuarioNomeForm').value,
                email: document.getElementById('usuarioEmailForm').value,
                password: document.getElementById('usuarioSenhaForm').value,
                password_confirmation: document.getElementById('usuarioConfirmaSenhaForm').value
            };
        }
    </script>
</body>
</html>
