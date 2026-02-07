document.addEventListener('DOMContentLoaded', () => {
    cargarCategorias();
    
    const form = document.getElementById('form-nuevo-producto');
    form.addEventListener('submit', guardarProducto);
});

const cargarCategorias = async () => {
    try {
        const res = await fetch('https://dummyjson.com/products/category-list');
        const categorias = await res.json();
        const select = document.getElementById('select-categoria-nuevo');
        
        categorias.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat.replace(/-/g, ' ');
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Error cargando categorías:", error);
    }
};


const guardarProducto = async (e) => {
    e.preventDefault(); 
    const formData = new FormData(e.target);
    const nuevoProducto = {
        title: formData.get('title'),
        price: parseFloat(formData.get('price')),
        category: formData.get('category'),
        description: formData.get('description')
    };

    try {
        const res = await fetch('https://dummyjson.com/products/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoProducto)
        });

        const data = await res.json();
        
        if (res.ok) {
            console.log("Respuesta de la API:", data);
            mostrarExito();
            e.target.reset();
        }
    } catch (error) {
        alert("Error al guardar el producto");
        console.error(error);
    }
};

const mostrarExito = () => {
    const alerta = document.getElementById('mensaje-exito');
    alerta.classList.remove('hidden');

    setTimeout(() => {
        alerta.classList.add('hidden');
    }, 5000);
};