import { useState, useEffect } from 'react';
import axios from 'axios';
import './style.scss';

const Tarefas = () => {
  const [tarefas, setTarefas] = useState([]);
  const [renderAddTask, setRenderAddTask] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tarefaSelecionada, setTarefaSelecionada] = useState(null);
  const [status, setStatus] = useState('');

  // Função para buscar tarefas
  const fetchTarefas = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/tarefas");
      setTarefas(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Use useEffect para chamar fetchTarefas assim que o componente for montado
  useEffect(() => {
    fetchTarefas();
  }, []); // A dependência vazia garante que isso aconteça apenas uma vez, quando o componente for montado

  const filtrarTarefas = (status) => {
    return tarefas.filter((tarefa) => tarefa.status === status);
  };

  const renderizarFormularioAddTask = (status) => {
    setRenderAddTask(status);
  };

  const criarTask = (e, status) => {
    e.preventDefault();
    const novaTarefa = { titulo, descricao, status };
  
    axios.post("http://localhost:8080/api/tarefas", novaTarefa)
      .then((response) => {
        // Atualize o estado com a nova tarefa
        setTarefas((prevTarefas) => [...prevTarefas, response.data]);
        setTitulo('');
        setDescricao('');
        setRenderAddTask(null);
        setIsModalOpen(false);  // Fecha o modal após adicionar
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const editTask = (e, id) => {
    e.preventDefault();
  
    const tarefaEditada = {
      titulo: titulo || tarefaSelecionada.titulo,
      descricao: descricao || tarefaSelecionada.descricao,
      status: status || tarefaSelecionada.status,
    };
  
    axios.put(`http://localhost:8080/api/tarefas/${id}`, tarefaEditada)
      .then(() => {
        fetchTarefas(); // Atualiza as tarefas
        setIsModalOpen(false);
        setTarefaSelecionada(null);
        setTitulo('');
        setDescricao('');
        setStatus('');
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const removeTask = (e, id) => {
    if (e) e.preventDefault();
  
    // Confirmar com o usuário antes de excluir
    const confirmDelete = window.confirm("Tem certeza que deseja excluir esta tarefa?");
    
    if (confirmDelete) {
      axios
        .delete(`http://localhost:8080/api/tarefas/${id}`)
        .then(() => {
          // Atualiza o estado removendo a tarefa com o id especificado
          setTarefas((prevTarefas) => prevTarefas.filter((tarefa) => tarefa.id !== id));
          setIsModalOpen(false);  // Fecha o modal após remover
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      console.log("Exclusão cancelada");
    }
  };
  

  return (
    <div className="container">
      <div className="tasks-container">
        {["FAZER", "FAZENDO", "FEITO"].map((status) => (
          <div className="task-column" key={status}>
            <h2>{status}</h2>
            <ul>
              {filtrarTarefas(status).map((tarefa) => (
                <li
                  key={tarefa.id}
                  className="task"
                  onClick={() => { setTarefaSelecionada(tarefa); setIsModalOpen(true); }}
                >
                  <h3>{tarefa.titulo}</h3>
                  <span>{tarefa.descricao}</span>
                </li>
              ))}
              {renderAddTask === status && (
                <div className="container-form">
                  <form onSubmit={(e) => criarTask(e, status)}>
                    <input
                      type="text"
                      placeholder="Título"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      required
                    />
                    <textarea
                      placeholder="Descrição"
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                    />
                    <button type="submit">Adicionar</button>
                  </form>
                </div>
              )}
              <button onClick={() => renderizarFormularioAddTask(status)}>Adicionar Tarefa</button>
            </ul>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Editar Tarefa</h2>
            {tarefaSelecionada && (
              <>
                <form onSubmit={(e) => editTask(e, tarefaSelecionada.id)}>
                  <label>
                    <p>Título:</p>
                    <input
                      type="text"
                      value={titulo || tarefaSelecionada?.titulo || ''}
                      onChange={(e) => setTitulo(e.target.value)}
                    />
                  </label>
                  <label>
                    <p>Descrição:</p>
                    <textarea
                      value={descricao || tarefaSelecionada?.descricao || ''}
                      onChange={(e) => setDescricao(e.target.value)}
                    />
                  </label>
                  <label>
                    <p>Status:</p>
                    <select className='option'
                      value={status || tarefaSelecionada?.status || ''}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="FAZER">Fazer</option>
                      <option value="FAZENDO">Fazendo</option>
                      <option value="FEITO">Feito</option>
                    </select>
                  </label>                  
                </form>
                <div className="box-buttons">
                  <button className='btn-salvar' type="submit">Salvar</button>
                  <button className='btn-remover' onClick={() => removeTask(null, tarefaSelecionada.id)}>Excluir</button>
                  <button className='btn-fechar' onClick={() => setIsModalOpen(false)}>Fechar</button>                
                </div>               
              </>
            )}            
          </div>
        </div>
      )}
    </div>
  );
};

export default Tarefas;
