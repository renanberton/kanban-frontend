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

  useEffect(() => {
    fetchTarefas();
  }, []);

  const fetchTarefas = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/tarefas");
      setTarefas(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filtrarTarefas = (status) => {
    return tarefas.filter((tarefa) => tarefa.status === status);
  };

  const criarTask = (e, status) => {
    e.preventDefault();
    const novaTarefa = { titulo, descricao, status };
    axios.post("http://localhost:8080/api/tarefas", novaTarefa).then((response) => {
      setTarefas([...tarefas, response.data]);
      setTitulo('');
      setDescricao('');
      setRenderAddTask(null);
    }).catch(console.error);
  };

  const editTask = (e, id) => {
    e.preventDefault();
    const tarefaEditada = {
      titulo: titulo || tarefaSelecionada.titulo,
      descricao: descricao || tarefaSelecionada.descricao,
      status: status || tarefaSelecionada.status,
    };
    axios.put(`http://localhost:8080/api/tarefas/${id}`, tarefaEditada).then(fetchTarefas).catch(console.error);
    setIsModalOpen(false);
  };

  const removeTask = (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta tarefa?")) {
      axios.delete(`http://localhost:8080/api/tarefas/${id}`).then(() => {
        setTarefas(tarefas.filter((tarefa) => tarefa.id !== id));
        setIsModalOpen(false);
      }).catch(console.error);
    }
  };

  const handleDragStart = (e, tarefa) => {
    e.dataTransfer.setData("tarefaId", tarefa.id);
  };

  const handleDrop = (e, novoStatus) => {
    e.preventDefault();
    const tarefaId = e.dataTransfer.getData("tarefaId");
    const tarefa = tarefas.find((t) => t.id == tarefaId);
    if (tarefa.status !== novoStatus) {
      axios.put(`http://localhost:8080/api/tarefas/${tarefaId}`, { ...tarefa, status: novoStatus })
        .then(fetchTarefas)
        .catch(console.error);
    }
  };

  return (
    <div className="container">
      <div className="tasks-container">
        {["FAZER", "FAZENDO", "FEITO"].map((status) => (
          <div key={status} className="task-column"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, status)}>
            <h2>{status}</h2>
            <ul>
              {filtrarTarefas(status).map((tarefa) => (
                <li key={tarefa.id} className="task" draggable onDragStart={(e) => handleDragStart(e, tarefa)}
                  onClick={() => { setTarefaSelecionada(tarefa); setIsModalOpen(true); }}>
                  <h3>{tarefa.titulo}</h3>
                  <span>{tarefa.descricao}</span>
                </li>
              ))}
              {renderAddTask === status && (
                <form onSubmit={(e) => criarTask(e, status)}>
                  <input type="text" placeholder="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
                  <textarea placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
                  <button type="submit">Adicionar</button>
                </form>
              )}
              <button onClick={() => setRenderAddTask(status)}>Adicionar Tarefa</button>
            </ul>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Editar Tarefa</h2>
            {tarefaSelecionada && (
              <form onSubmit={(e) => editTask(e, tarefaSelecionada.id)}>
                <input type="text" value={titulo || tarefaSelecionada.titulo} onChange={(e) => setTitulo(e.target.value)} />
                <textarea value={descricao || tarefaSelecionada.descricao} onChange={(e) => setDescricao(e.target.value)} />
                <select className='option' value={status || tarefaSelecionada.status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="FAZER">Fazer</option>
                  <option value="FAZENDO">Fazendo</option>
                  <option value="FEITO">Feito</option>
                </select>
                <div className="box-buttons">
                  <button className='btn-salvar' type="submit">Salvar</button>
                  <button className='btn-remover' onClick={() => removeTask(tarefaSelecionada.id)}>Excluir</button>
                  <button className='btn-fechar' onClick={() => setIsModalOpen(false)}>Fechar</button> 
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tarefas;
