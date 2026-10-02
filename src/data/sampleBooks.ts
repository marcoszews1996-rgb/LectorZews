import { PDFDocumentData } from '../types';
import { createDocumentFromText } from '../utils/pdfParser';

export interface SampleBookItem {
  id: string;
  title: string;
  author: string;
  genre: string;
  language: string;
  doc: PDFDocumentData;
}

const DON_QUIJOTE_TEXT = `En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivía un hidalgo de los de lanza en astillero, adarga antigua, rocín flaco y galgo corredor.

Una olla de algo más vaca que carnero, salpicón las más noches, duelos y quebrantos los sábados, lantejas los viernes, algún palomino de añadidura los domingos, consumían las tres partes de su hacienda.

El resto della concluían sayo de velarte, calzas de velludo para las fiestas, con sus pantuflos de lo mesmo, y los días de entresemana se honraba con su vellorí de lo más fino.

Tenía en su casa una ama que pasaba de los cuarenta, y una sobrina que no llegaba a los veinte, y un mozo de campo y plaza, que así ensillaba el rocín como tomaba la podadera.

Frisaba la edad de nuestro hidalgo con los cincuenta años; era de complexión recia, seco de carnes, enjuto de rostro, gran madrugador y amigo de la caza. Quieren decir que tenía el sobrenombre de Quijada, o Quesada, que en esto hay alguna diferencia en los autores que deste caso escriben.

Es, pues, de saber que este sobredicho hidalgo, los ratos que estaba ocioso, que eran los más del año, se daba a leer libros de caballerías, con tanta afición y gusto, que olvidó casi de todo punto el ejercicio de la caza, y aun la administración de su hacienda. Y llegó a tanto su curiosidad y desatino en esto, que vendió muchas hanegas de tierra de sembradura para comprar libros de caballerías en que leer.`;

const EL_PRINCIPITO_TEXT = `Pido perdón a los niños por haber dedicado este libro a una persona grande. Tengo una seria razón para ello: esta persona grande es el mejor amigo que tengo en el mundo.

Tengo otra razón: esta persona grande puede comprenderlo todo, hasta los libros para niños. Tengo una tercera razón: esta persona grande vive en Francia, donde tiene hambre y frío. Tiene verdadera necesidad de consuelo.

Si todas estas razones no bastaran, quiero dedicar este libro al niño que esta persona grande fue en otro tiempo. Todas las personas grandes han sido niños antes. Pero pocas de ellas lo recuerdan.

Viví así, solo, sin nadie con quien hablar verdaderamente, hasta que tuve una avería en el desierto de Sahara, hace seis años. Algo se había roto en mi motor. Y como no llevaba conmigo ni mecánico ni pasajeros, me dispuse a realizar, solo, una difícil reparación. Era para mí una cuestión de vida o muerte. Tenía agua de beber apenas para ocho días.

La primera noche me dormí sobre la arena, a mil millas de toda tierra habitada. Estaba más aislado que un náufrago en una balsa en medio del océano. Imaginaos, pues, mi sorpresa cuando, al romper el día, me despertó una extraña vocecita que decía:
—Por favor... ¡dibújame un cordero!
—¿Eh?
—Dibújame un cordero...`;

const CIEN_ANOS_TEXT = `Muchos años después, frente al pelotón de fusilamiento, el coronel Aureliano Buendía había de recordar aquella tarde remota en que su padre lo llevó a conocer el hielo.

Macondo era entonces una aldea de veinte casas de barro y cañabrava construidas a la orilla de un río de aguas diáfanas que se precipitaban por un lecho de piedras pulidas, blancas y enormes como huevos prehistóricos.

El mundo era tan reciente, que muchas cosas carecían de nombre, y para mencionarlas había que señalarlas con el dedo. Todos los años, por el mes de marzo, una familia de gitanos desarrapados plantaba su carpa cerca de la aldea, y con un grande alboroto de pitos y timbales daban a conocer los nuevos inventos.

Primero llevaron el imán. Un gitano corpulento, de barba montaraz y manos de gorrión, que se presentó con el nombre de Melquíades, hizo una truculenta demostración pública de lo que él mismo llamaba la octava maravilla de los sabios alquimistas de Macedonia.

Fue de casa en casa arrastrando dos lingotes metálicos, y todo el mundo se espantó al ver que los calderos, las pailas, las tenazas y los anafes se caían de su sitio, y las maderas crujían por la desesperación de los clavos y los tornillos tratando de desenclavarse.`;

const EL_CORAZON_DELATOR_TEXT = `¡Es verdad! Siempre he sido nervioso, muy nervioso, terriblemente nervioso. ¿Pero por qué afirman ustedes que estoy loco? La enfermedad había agudizado mis sentidos, no los había destruido ni embotado. Sobre todo era muy agudo el sentido del oído. Oía todas las cosas del cielo y de la tierra, y no pocas del infierno. ¿Cómo he de estar loco entonces? Escuchen con atención y observen con cuánta cordura, con cuánta tranquilidad puedo contarles toda la historia.

Es imposible decir cómo aquella idea penetró por primera vez en mi cerebro; pero una vez concebida, me acosó día y noche. Motivo no había ninguno. Pasión tampoco. Yo quería al viejo. Jamás me había hecho daño. Jamás me había insultado. Su dinero no me interesaba en absoluto. ¡Me parece que fue su ojo! ¡Sí, fue eso! Tenía un ojo semejante al de un buitre, un ojo celeste y frío, velado por una pálida telilla. Cada vez que ese ojo caía sobre mí, se me helaba la sangre en las venas; y así, lentamente, con extrema frialdad, resolví quitarle la vida al viejo para librarme para siempre de esa mirada.

¡Presten atención! Ustedes me toman por loco. Pero los locos no saben nada de nada. ¡En cambio, si me hubieran visto a mí! Si hubieran visto con qué sabiduría procedí, con qué precaución, con qué disimulo me puse a trabajar. Jamás fui tan amable con el viejo como durante la semana que precedió al crimen. Todas las noches, alrededor de las doce, giraba el picaporte de su puerta y la abría, ¡oh, tan suavemente! Y cuando la abertura era suficiente, introducía una linterna oscura, bien tapada, para que no saliera una sola chispa de luz, y luego asomaba la cabeza.

¡Ah, se habrían reído al ver con qué astucia asomaba la cabeza! La movía despacio, muy despacio, para no turbar el sueño del anciano. Me llevaba una hora entera meter toda la cabeza por la rendija. ¿Habría un loco sido tan perspicaz? Y entonces, cuando mi cabeza estaba adentro, abría la linterna con cautela, apenas lo indispensable para que un único y fino hilo de luz cayera directo sobre el ojo de buitre.

Hice esto durante siete largas noches, cada noche a las doce en punto; pero siempre encontré el ojo cerrado, y por eso me fue imposible consumar la obra, porque no era el viejo quien me atormentaba, sino su maldito ojo. Y a la octava noche fui aún más cuidadoso. La aguja de un reloj se mueve más rápido de lo que se movía mi mano. Sentí el latido sordo, veloz y amortiguado... como el tic-tac de un reloj envuelto en algodón. ¡Era el latido del corazón del viejo!`;

const THE_RAVEN_TEXT = `Once upon a midnight dreary, while I pondered, weak and weary,
Over many a quaint and curious volume of forgotten lore—
While I nodded, nearly napping, suddenly there came a tapping,
As of some one gently rapping, rapping at my chamber door.
"'Tis some visiter," I muttered, "tapping at my chamber door—
Only this and nothing more."

Ah, distinctly I remember it was in the bleak December;
And each separate dying ember wrought its ghost upon the floor.
Eagerly I wished the morrow;—vainly I had sought to borrow
From my books surcease of sorrow—sorrow for the lost Lenore—
For the rare and radiant maiden whom the angels name Lenore—
Nameless here for evermore.

And the silken, sad, uncertain rustling of each purple curtain
Thrilled me—filled me with fantastic terrors never felt before;
So that now, to still the beating of my heart, I stood repeating
"'Tis some visiter entreating entrance at my chamber door—
Some late visiter entreating entrance at my chamber door;—
This it is and nothing more."`;

export const SAMPLE_BOOKS: SampleBookItem[] = [
  {
    id: 'corazon_delator',
    title: 'El Corazón Delator',
    author: 'Edgar Allan Poe',
    genre: 'Terror Psicológico',
    language: 'es',
    doc: createDocumentFromText('El Corazón Delator', EL_CORAZON_DELATOR_TEXT),
  },
  {
    id: 'quijote',
    title: 'Don Quijote de la Mancha',
    author: 'Miguel de Cervantes',
    genre: 'Clásico Universal',
    language: 'es',
    doc: createDocumentFromText('Don Quijote de la Mancha', DON_QUIJOTE_TEXT),
  },
  {
    id: 'principito',
    title: 'El Principito',
    author: 'Antoine de Saint-Exupéry',
    genre: 'Fábula Filosófica',
    language: 'es',
    doc: createDocumentFromText('El Principito', EL_PRINCIPITO_TEXT),
  },
  {
    id: 'macondo',
    title: 'Cien Años de Soledad',
    author: 'Gabriel García Márquez',
    genre: 'Realismo Mágico',
    language: 'es',
    doc: createDocumentFromText('Cien Años de Soledad', CIEN_ANOS_TEXT),
  },
  {
    id: 'the_raven',
    title: 'The Raven (El Cuervo)',
    author: 'Edgar Allan Poe',
    genre: 'Poesía Gótica (English)',
    language: 'en',
    doc: createDocumentFromText('The Raven', THE_RAVEN_TEXT),
  },
];
