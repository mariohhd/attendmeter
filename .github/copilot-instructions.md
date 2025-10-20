Attendmeter es un proyecto hecho con astro y usando islas en react.

El objetivo del proyecto es poder personalizar el calendario de las personas que asisten a la Escuela Oficial de Idioas (EOI) para conocer el porcentaje de asistencia de los alumnos.

Para ello se describen los siguientes flujos funcionales:

1) Se mostrará la descripción de los datos de la clase con los siguientes campos:
    a) Idioma: Inglés, Francés o Alemán.
    b) Nivel del curso: a1, a2.1, a2.2, b1, b2.1, b2.2, c1, c2
    c) Contacto de la docente: el email de educa madrid.
    d) Los días de las clases: normalmente son lunes y miércoles ó jueves y viernes
    e) horario de la clase: normalmente de 18:40 a 21 horas.
2) Se mostrará de forma gráfica un termómetro marcando el porcentaje de asistencia del alumno. Si el porcentaje es menor a un 65% se mostrará rojo, si el porcentaje está entre un 65% y un 75% se mostrará naranja y si es superior a un 75% se mostrará verde.
3) El calculo se hará teniendo en cuenta las clases totales impartidas hasta el día actual, sin contar los festivos ni las ausencias del docente.
4) Se tiene que mostrar una sección que se muestren los últimos 5 días de clases y su estado.
5) Se habilitará un desplegable en el que el alumno podrá revisar todos los días de clase e indicar si asistió o no y el motivo.
6) La información se tiene que persistir en el localStorage del navegador.
7) El UX tiene que ser amigable, con formas cercarnas y colores suaves y atractivos.

En cuanto al código, hay que utilizar clean code y hacer tests en la medida de lo posible. Hay que tener las buenas prácticas de astro y react.

La versión de node a usar es la 22.