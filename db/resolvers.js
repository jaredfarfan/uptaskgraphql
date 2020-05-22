const Usuario = require('../models/Usuario')
const Proyecto = require('../models/Proyecto')
const Tarea = require('../models/Tarea')

const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'variables.env' });

const crearToken = (usuario, secreta, expiresIn) => {
    // console.log(usuario);
    const { id, email, nombre } = usuario;
    //payload=informacion que se agregara a la cabezera del webtoken
    return jwt.sign({ id, email, nombre }, secreta, { expiresIn })
}

const resolvers = {
    Query: {
        obtenerProyectos: async (_, { }, ctx) => {
            const proyectos = await Proyecto.find({ creador: ctx.usuario.id });
            return proyectos;
        },
        obtenerTareas: async (_, { input }, ctx) => {
            const tareas = await Tarea.find({ creador: ctx.usuario.id }).where('proyecto').equals(input.proyecto);
            return tareas;
        }
    },
    Mutation: {
        crearUsuario: async (_, { input }, ctx) => {
            const { email, password } = input;

            const existeUsuario = await Usuario.findOne({ email });

            //si el usuario existe 
            if (existeUsuario) {
                throw new Error('El usuario ya esta registrado');

            }

            try {
                // Hashear su password
                const salt = await bcryptjs.genSalt(10);
                input.password = await bcryptjs.hash(password, salt);

                const nuevoUsuario = new Usuario(input);
                console.log(nuevoUsuario);
                nuevoUsuario.save();
                return "Creado correctamente";

            } catch (error) {
                console.log(error);

            }
        },
        autenticarUsuario: async (_, { input }) => {
            console.log(input);

            const { email, password } = input;

            // Si el usuario existe
            const existeUsuario = await Usuario.findOne({ email });
            if (!existeUsuario) {
                throw new Error('El usuario no existe');
            }

            // Revisar si el password es correcto
            const passwordCorrecto = await bcryptjs.compare(password, existeUsuario.password);
            if (!passwordCorrecto) {
                throw new Error('El Password es Incorrecto');
            }

            //dar acceso a la app
            // Crear el token
            return {
                token: crearToken(existeUsuario, process.env.SECRETA, '8h')
            }


        },
        nuevoProyecto: async (_, { input }, ctx) => {
            //console.log('creado proyecto');
            try {
                const proyecto = new Proyecto(input);

                //asociar el creacodr 

                proyecto.creador = ctx.usuario.id;
                //almacenar
                const resultado = await proyecto.save();
                return resultado;
            } catch (error) {
                console.log(error);

            }

        },
        actualizarProyecto: async (_, { id, input }, ctx) => {
            //REVIAR SI EL proyecto eciste o no
            let proyecto = await Proyecto.findById(id);
            if (!proyecto) {
                throw new Error('Proyecto no encontrado');
            }
            //revisar que si la persona trata de editarlo es el creador
            if (proyecto.creador.toString() !== ctx.usuario.id) {
                throw new Error('No tienes las credenciales para editar');
            }
            //guardar el proyeto
            proyecto = await Proyecto.findByIdAndUpdate({ _id: id }, input, { new: true });
            return proyecto;
        },
        eliminarProyecto: async (_, { id }, ctx) => {
            //REVIAR SI EL proyecto eciste o no
            let proyecto = await Proyecto.findById(id);
            if (!proyecto) {
                throw new Error('Proyecto no encontrado');
            }
            //revisar que si la persona trata de editarlo es el creador
            if (proyecto.creador.toString() !== ctx.usuario.id) {
                throw new Error('No tienes las credenciales para editar');
            }
            //eliminar
            await Proyecto.findByIdAndDelete({ _id: id });
            return "Se eleminó correctamente";
        },

        nuevaTarea: async (_, { input }, ctx) => {
            //console.log('creado proyecto');
            try {
                const tarea = new Tarea(input);

                //asociar el creacodr 

                tarea.creador = ctx.usuario.id;
                //almacenar
                const resultado = await tarea.save();
                return resultado;
            } catch (error) {
                console.log(error);

            }

        },
        actualizarTarea: async (_, { id, input, estado }, ctx) => {
            //REVIAR SI la tarea existe o no
            let tarea = await Tarea.findById(id);
            if (!tarea) {
                throw new Error('Tarea no encontrado');
            }
            //revisar que si la persona trata de editarlo es el creador
            if (tarea.creador.toString() !== ctx.usuario.id) {
                throw new Error('No tienes las credenciales para editar');
            }
            //guardar el proyeto
            input.estado = estado;
            tarea = await Tarea.findByIdAndUpdate({ _id: id }, input, { new: true });
            return tarea;
        },
        eliminarTarea: async (_, { id }, ctx) => {
            //REVIAR SI EL proyecto eciste o no
            let tarea = await Tarea.findById(id);
            if (!tarea) {
                throw new Error('Proyecto no encontrado');
            }
            //revisar que si la persona trata de editarlo es el creador
            if (tarea.creador.toString() !== ctx.usuario.id) {
                throw new Error('No tienes las credenciales para editar');
            }
            //eliminar
            await Tarea.findByIdAndDelete({ _id: id });
            return "Se eleminó correctamente";
        }

    }
}

module.exports = resolvers;