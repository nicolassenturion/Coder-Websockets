import * as fs from 'fs/promises';

const typeProduct = {
    title: "string",
    description: "string",
    code: "string",
    price: "number",
    stock: "number",
    category: "string",
    status: "boolean",
};

class ProductManager {

    #nextId

    constructor() {
        this.#nextId = 1;
        this.path = './products.json';
    }

    async addProduct({title, description, price, thumbnail = null, code, stock, category, status = true}) {
        try {
            if (!title || !description || !code || !price || !stock || !category) throw new Error('Todos los campos son obligatorios');

            if (!(typeof title === typeProduct.title) || !(typeof description === typeProduct.description) || !(typeof code === typeProduct.code) || !(typeof price === typeProduct.price) || !(typeof stock === typeProduct.stock) || !(typeof category === typeProduct.category) || !(typeof status === typeProduct.status)) throw new Error('Los tipos de datos son incorrectos');

            const arrProducts = await this.getProducts();
            const isExist = await this.getProductExists('code', code, arrProducts);

            if (isExist) {
                this.#nextId = this.#nextId - 1;
                throw new Error(`El codigo: ${code} ingresado ya existe`);
            }

            const newProduct = {
                id: this.#nextId++,
                title,
                description,
                code,
                price,
                status,
                stock,
                category,
                thumbnail,
            };

            const addProducts = [...arrProducts, newProduct];

            await fs.writeFile(this.path, JSON.stringify(addProducts));

            return {message: `Producto creado con exito`, product: newProduct};

        } catch (error) {
            throw {error: error.message};
        }
    }

    async getProducts() {
        try {
            const data = await this.readFile();
            return JSON.parse(data);

        } catch (error) {
            throw error;
        }
    }

    async getProductById(id) {
        try {

            const data = await this.readFile();
            const product = JSON.parse(data).find(product => product.id === id);

            if (!product) throw new Error("El producto no existe");

            return product;

        } catch (error) {
            throw {error: error.message};
        }
    }

    async updateProductById(obj, id) {
        try {
            const data = await this.getProducts();
            const isExist = await this.getProductExists('id', id, data);

            if (!isExist) throw new Error(`No se encontro el id ${id} para modificar.`);

            const result = data.map(item => item.id === id ? {...item, ...obj} : item);
            await fs.writeFile(this.path, JSON.stringify(result));
            return {message: `Producto ID ${id} actualizado con exito`};

        } catch (error) {
            throw {error: error.message};
        }

    }

    async deleteProductById(id) {
        try {
            const data = await this.getProducts();

            const isExist = await this.getProductExists('id', id, data);
            if (!isExist) throw new Error(`No se encontro el id: ${id} para eliminar.`);

            const result = data.filter(product => product.id !== id);
            await fs.writeFile(this.path, JSON.stringify(result));

            return {message: `Producto ID ${id} eliminado con exito`}

        } catch (error) {
            throw {error: error.message};
        }
    }

    async getProductExists(key, value, data) {
        try {
            return data.find(product => product[key] === value);
        } catch (error) {
            throw error;
        }
    }

    async createFile() {
        try {
            await fs.readFile(this.path, {encoding: 'utf-8'});
            this.#nextId = await this.getLastId();
            return 'El archivo ya se encuentra creado';
        } catch (error) {
            await fs.writeFile(this.path, '[]',);
            return 'Archivo creado con exito';
        }
    }

    async readFile() {
        try {
            return await fs.readFile(this.path, {encoding: 'utf-8'});
        } catch (error) {
            throw error;
        }
    }

    async getLastId() {
        try {
            let lastId = this.#nextId;
            const data = await this.getProducts();
            for (let i = 0; i < data.length; i++) {
                if (data[i].id > lastId) {
                    lastId = data[i].id;
                }
            }

            return lastId + 1;

        } catch (error) {
            throw error;
        }
    }
}

export default ProductManager;
