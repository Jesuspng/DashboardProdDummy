// Estado global de la aplicación
const state = {
    limit: 10,
    skip: 0,
    total: 0,
    searchQuery: '',
    category: '',
    sortBy: 'title',
    order: 'asc'
};

document.addEventListener('DOMContentLoaded', () => {
    cargarCategorias();
    cargarProductos();
    configurarEventos(); 
});

const configurarEventos = () => {

    const inputSearch = document.getElementById('input-search');
    inputSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            state.searchQuery = e.target.value;
            state.category = ''; 
            state.skip = 0;     
            cargarProductos();
        }
    });


    const selectCat = document.getElementById('select-categoria');
    selectCat.addEventListener('change', (e) => {
        state.category = e.target.value;
        state.searchQuery = ''; 
        state.skip = 0;         
        cargarProductos();
    });
};

const siguientePagina = () => {
    if (state.skip + state.limit < state.total) {
        state.skip += state.limit;
        cargarProductos();
    }
};

const anteriorPagina = () => {
    if (state.skip >= state.limit) {
        state.skip -= state.limit;
        cargarProductos();
    }
};

const renderizarTabla = (productos) => {
    const contenedor = document.getElementById('cuerpo-tabla');
    contenedor.innerHTML = ''; 

    productos.forEach(prod => {
        contenedor.innerHTML += `
            <tr>
                <td>${prod.id}</td>
                <td><img src="${prod.thumbnail}" width="50"></td>
                <td>${prod.title}</td>
                <td>$${prod.price}</td>
                <td>${prod.category}</td>
                <td>
                     <button onclick="eliminarProducto(${prod.id}, this.closest('tr'))">Eliminar</button>
                    <button onclick="editarProducto(${prod.id}, this.closest('tr'))">Editar</button>
                </td>
            </tr>
        `;
    });
};

const eliminarProducto = async (id, filaElemento) => {
    if (confirm(`¿Estás seguro de que deseas eliminar el producto #${id}?`)) {
        try {
            const res = await fetch(`https://dummyjson.com/products/${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();

            if (res.ok && data.isDeleted) {
                filaElemento.remove(); 
                alert(`Producto #${id} eliminado (Simulado).`);
            }
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    }
};

const editarProducto = async (id, filaElemento) => {
    const nuevoTitulo = prompt("Nuevo nombre del producto:");
    const nuevoPrecio = prompt("Nuevo precio:");

    if (nuevoTitulo && nuevoPrecio) {
        try {
            const res = await fetch(`https://dummyjson.com/products/${id}`, {
                method: 'PUT', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: nuevoTitulo,
                    price: parseFloat(nuevoPrecio)
                })
            });
            const data = await res.json();

            if (res.ok) {
                filaElemento.cells[2].innerText = data.title;
                filaElemento.cells[3].innerText = `$${data.price}`;
                alert("Producto actualizado con éxito (Simulado).");
            }
        } catch (error) {
            console.error("Error al actualizar:", error);
        }
    }
};

const actualizarPaginacion = () => {
    const info = document.getElementById('info-paginacion');
    const paginaActual = (state.skip / state.limit) + 1;
    const totalPaginas = Math.ceil(state.total / state.limit);
    
    info.textContent = `Página ${paginaActual} de ${totalPaginas || 1}`;
};



const cargarCategorias = async () => {
    const res = await fetch('https://dummyjson.com/products/category-list');
    const categorias = await res.json();
    const select = document.getElementById('select-categoria');
    
    categorias.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat.replace(/-/g, ' '); // Formatear texto
        select.appendChild(option);
    });
};

const cargarProductos = async () => {
    let baseUrl = `https://dummyjson.com/products`;
    
    if (state.searchQuery) {
        baseUrl += `/search`;
    } else if (state.category) {
        baseUrl += `/category/${state.category}`;
    }

    const params = new URLSearchParams({
        limit: state.limit,
        skip: state.skip
    });

    if (state.searchQuery) params.append('q', state.searchQuery);

    if (!state.searchQuery) {
        params.append('sortBy', state.sortBy);
        params.append('order', state.order);
    }

    const finalUrl = `${baseUrl}?${params.toString()}`;

    try {
        const res = await fetch(finalUrl);
        const data = await res.json();
        
        state.total = data.total;
        renderizarTabla(data.products);
        actualizarPaginacion();
    } catch (error) {
        console.error("Error cargando productos:", error);
    }
};