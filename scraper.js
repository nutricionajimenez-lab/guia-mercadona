#!/usr/bin/env node
// Guía Saludable Mercadona - Scraper v2
// Uso: node scraper.js
// Requiere Node 18+ (fetch nativo)

import { writeFileSync, mkdirSync, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGENES_DIR = path.join(__dirname, 'imagenes');
const WH = 'vlc1';
const BASE = 'https://tienda.mercadona.es/api';

mkdirSync(IMAGENES_DIR, { recursive: true });

// ── Beneficios por tipo de producto ─────────────────────────────────────────
function getBeneficios(nombre, categoriaNombre) {
  const n = nombre.toLowerCase();
  const c = categoriaNombre.toLowerCase();

  if (n.includes('aceite de oliva virgen extra') || n.includes('aove'))
    return 'Rico en ácidos grasos monoinsaturados (oleico) y antioxidantes naturales (polifenoles y vitamina E). Protege el corazón, reduce la inflamación y mejora el perfil lipídico. Ideal en crudo para aprovechar al máximo sus propiedades.';
  if (n.includes('aceite de oliva'))
    return 'Fuente de grasas monoinsaturadas saludables. Aporta vitamina E y contribuye a reducir el colesterol LDL. Excelente para cocinar a temperaturas medias-altas.';
  if (n.includes('aceite de lino'))
    return 'Fuente vegetal de omega-3 ALA. Rico en lignanos con propiedades antioxidantes. Ideal en crudo, nunca para cocinar.';
  if (n.includes('nuez'))
    return 'Una de las fuentes vegetales más ricas en omega-3 (ALA). Aportan proteínas, fibra, magnesio y vitamina B6. Su consumo regular está asociado a mejor salud cardiovascular y función cerebral.';
  if (n.includes('almendra'))
    return 'Ricas en vitamina E, magnesio, calcio y proteína vegetal. Sus grasas monoinsaturadas reducen el colesterol LDL. Ideales como snack saludable y muy saciantes.';
  if (n.includes('anacardo') || n.includes('cashew'))
    return 'Fuente de hierro, zinc, magnesio y cobre. Sus grasas monoinsaturadas cuidan el corazón. Aportan triptófano, precursor de la serotonina, favoreciendo el estado de ánimo.';
  if (n.includes('pistacho'))
    return 'Alto contenido en proteínas vegetales, fibra, potasio y antioxidantes (luteína, zeaxantina). Ayuda a controlar el azúcar en sangre y mejora la salud ocular.';
  if (n.includes('avellana'))
    return 'Ricas en vitamina E, ácido fólico y manganeso. Sus antioxidantes protegen frente al estrés oxidativo. Fuente de energía de lenta liberación, perfectas para el desayuno.';
  if (n.includes('pipa') || n.includes('girasol'))
    return 'Fuente excepcional de vitamina E (antioxidante), selenio, magnesio y zinc. Sus grasas poliinsaturadas contribuyen a la salud cardiovascular.';
  if (n.includes('semilla de chía') || n.includes('chía'))
    return 'Superalimento rico en omega-3, fibra soluble e insoluble, calcio y antioxidantes. Regula el tránsito intestinal, mejora la saciedad y estabiliza el azúcar en sangre.';
  if (n.includes('semilla de lino') || n.includes('lino'))
    return 'Excelente fuente de omega-3 vegetal (ALA) y lignanos (fitoestrógenos antioxidantes). Favorece el tránsito intestinal y puede contribuir al equilibrio hormonal.';
  if (n.includes('dátil'))
    return 'Endulzante natural con alto contenido en fibra, potasio, magnesio y hierro. Energía de liberación rápida y natural. Aliados del sistema digestivo.';
  if (n.includes('arándano') || n.includes('arandano'))
    return 'Uno de los alimentos con mayor capacidad antioxidante. Rico en antocianinas que protegen la vista, el corazón y el sistema nervioso. Alto contenido en vitamina C.';
  if (n.includes('salmón') || n.includes('salmon'))
    return 'Pescado azul estrella: altísimo en omega-3 EPA y DHA, vitamina D, vitamina B12 y proteínas de alta calidad. Clave para la salud cardiovascular, el cerebro y el sistema inmune.';
  if (n.includes('sardina'))
    return 'Rica en omega-3, calcio (con espina), vitamina D y B12. Proteína completa y de alta biodisponibilidad. Una de las conservas más saludables y económicas disponibles.';
  if (n.includes('atún') || n.includes('atun'))
    return 'Proteína magra de alta calidad con bajo contenido en grasa saturada. Fuente de selenio, yodo y vitamina B3. El atún al natural conserva mejor todos sus nutrientes.';
  if (n.includes('caballa') || n.includes('mackerel'))
    return 'Pescado azul con elevado contenido en omega-3, vitamina B12 y selenio. Apoya la salud cardiovascular, cognitiva y el sistema inmunológico.';
  if (n.includes('merluza'))
    return 'Pescado blanco bajo en grasas, alto en proteínas de calidad. Aporta yodo, fósforo y vitaminas B. Muy fácil de digerir e ideal en dietas ligeras.';
  if (n.includes('bacalao'))
    return 'Proteína magra de alta biodisponibilidad, bajo en grasas y rico en vitamina B12, yodo y fósforo. El bacalao desalado es versátil y saciante.';
  if (n.includes('dorada') || n.includes('lubina'))
    return 'Pescado semigraso con buen aporte de omega-3, proteínas de calidad, yodo y fósforo. Su contenido en vitamina D lo hace valioso para huesos y sistema inmune.';
  if (n.includes('mejillón') || n.includes('almeja') || n.includes('berberecho'))
    return 'Marisco excepcional: proteína magra, hierro de alta biodisponibilidad, zinc y vitamina B12. Bajo en calorías y muy nutritivo. El hierro del mejillón se absorbe mejor que el vegetal.';
  if (n.includes('gamba') || n.includes('langostino') || n.includes('gambón'))
    return 'Fuente de proteína magra, yodo, zinc y selenio. Bajo en grasas y calorías. El selenio actúa como antioxidante potente y apoya la función tiroidea.';
  if (n.includes('alistado') || n.includes('calamar'))
    return 'Marisco bajo en grasa y calorías con alto contenido proteico. Fuente de zinc, cobre y vitamina B12. Su tinta contiene melanina con propiedades antioxidantes.';
  if (n.includes('huevo'))
    return 'Considerado el alimento proteico de referencia. Un huevo completo aporta todos los aminoácidos esenciales, vitaminas A, D, E, B12, colina (salud cerebral) y luteína (salud ocular). Nutritivo y versátil.';
  if (n.includes('leche entera'))
    return 'Fuente natural y biodisponible de calcio, fósforo y proteínas. La leche entera añade vitaminas liposolubles A y D en su forma natural. Ideal para niños y personas con alto desgaste.';
  if (n.includes('leche semidesnatada') || n.includes('leche desnatada'))
    return 'Aporta calcio, fósforo y proteínas de calidad con menos grasa saturada que la leche entera. Buena opción para adultos que cuidan el aporte calórico sin renunciar al calcio.';
  if (n.includes('bebida de avena') || n.includes('bebida de soja') || n.includes('bebida vegetal'))
    return 'Alternativa vegetal a la leche, generalmente enriquecida con calcio y vitamina D. La de soja tiene el mejor perfil proteico. Sin lactosa, apta para intolerantes.';
  if (n.includes('yogur natural') || (n.includes('yogur') && !n.includes('azucar') && !n.includes('sabor')))
    return 'El yogur natural aporta proteínas, calcio y bacterias probióticas que mejoran la microbiota intestinal. Consumo regular asociado a mejor digestión e inmunidad.';
  if (n.includes('kéfir') || n.includes('kefir'))
    return 'Bebida fermentada con mayor densidad de probióticos que el yogur. Mejora la salud intestinal, el sistema inmune y la absorción de nutrientes como el calcio.';
  if (n.includes('queso fresco') || n.includes('cottage') || n.includes('requesón'))
    return 'Queso bajo en grasa con alto contenido proteico y calcio. Versátil en cocina y más ligero que los quesos curados. Ideal para deportistas y control de peso.';
  if (n.includes('pechuga') || n.includes('pollo') || n.includes('pavo'))
    return 'Proteína magra de alta calidad y bajo contenido en grasa saturada. Rica en vitaminas B3 y B6, fósforo y selenio. Base de cualquier dieta equilibrada y especialmente recomendada para deportistas.';
  if (n.includes('lenteja'))
    return 'Legumbre con el mejor equilibrio proteína-fibra. Aporta hierro vegetal, ácido fólico, zinc y carbohidratos de liberación lenta. Clave para la microbiota intestinal y la energía sostenida.';
  if (n.includes('garbanzo'))
    return 'Alto en proteína vegetal, fibra, hierro y folato. Su fibra soluble regula el colesterol y la glucemia. Base de la dieta mediterránea con probados beneficios cardiovasculares. Versátil en cocina.';
  if (n.includes('judía') || n.includes('alubia') || n.includes('frijol'))
    return 'Ricas en proteína vegetal, fibra, potasio y magnesio. Reducen el colesterol y estabilizan el azúcar en sangre. Fuente de folato esencial para el embarazo.';
  if (n.includes('soja') || n.includes('edamame'))
    return 'La legumbre más proteica con todos los aminoácidos esenciales. Rica en isoflavonas con beneficios cardiovasculares y óseos. Fuente importante de calcio vegetal.';
  if (n.includes('avena'))
    return 'Cereal integral rey de los desayunos. Sus beta-glucanos (fibra soluble) reducen el colesterol LDL demostrado científicamente. Energía de liberación lenta, rico en magnesio, zinc y vitaminas B.';
  if (n.includes('arroz integral') || (n.includes('arroz') && n.includes('integral')))
    return 'Conserva el salvado con fibra, vitaminas B y minerales. Índice glucémico más bajo que el arroz blanco. Favorece el tránsito intestinal y proporciona energía sostenida sin picos de glucosa.';
  if (n.includes('quinoa') || n.includes('quínoa'))
    return 'Pseudocereal con proteína completa (todos los aminoácidos esenciales), hierro, magnesio y fibra. Sin gluten y bajo índice glucémico. Ideal para deportistas y dietas plant-based.';
  if (n.includes('muesli') || n.includes('granola'))
    return 'Mezcla de cereales integrales, frutos secos y frutas desecadas. Rico en fibra, vitaminas B y minerales. Energía sostenida para empezar el día con vitalidad. Elige versiones sin azúcar añadido.';
  if (n.includes('copos de maíz') || n.includes('corn flakes'))
    return 'Cereal de desayuno ligero y fácil de digerir. Las versiones sin azúcar añadido son una buena fuente de carbohidratos y vitaminas del grupo B. Mejores enriquecidos con hierro.';
  if (n.includes('espelta'))
    return 'Cereal ancestral con mayor contenido en proteínas, fibra y minerales que el trigo común. Su gluten es más soluble y tolerado por algunos sensibles al trigo convencional.';
  if (n.includes('brócoli') || n.includes('brocoli'))
    return 'Uno de los vegetales más completos: vitamina C, K, folato, fibra y sulforafano (antioxidante con propiedades anticancerígenas). Bajo en calorías y muy nutritivo.';
  if (n.includes('espinaca'))
    return 'Fuente excepcional de hierro vegetal, ácido fólico, vitaminas K y A, y magnesio. Bajo en calorías y con propiedades antiinflamatorias potentes.';
  if (n.includes('tomate'))
    return 'Rico en licopeno (potente antioxidante), vitamina C y potasio. El licopeno aumenta su biodisponibilidad con el cocinado y el aceite de oliva.';
  if (n.includes('zanahoria'))
    return 'Excepcional fuente de beta-caroteno (provitamina A) para la salud ocular, inmune y cutánea. Rica en fibra y antioxidantes. Se absorbe mejor cocinada con grasa.';
  if (n.includes('aguacate'))
    return 'Fruta única en su composición: rica en grasas monoinsaturadas (oleico), potasio, vitamina E y folato. Mejora la absorción de antioxidantes de otros alimentos.';
  if (n.includes('naranja') || n.includes('mandarina'))
    return 'Fuente destacada de vitamina C y flavonoides. Refuerza el sistema inmune, mejora la absorción de hierro vegetal y tiene propiedades antiinflamatorias.';
  if (n.includes('manzana'))
    return 'Rica en quercetina (antioxidante), pectina (fibra soluble prebiótica) y vitamina C. Regula el azúcar en sangre y favorece la microbiota intestinal. "Una manzana al día...".';
  if (n.includes('plátano') || n.includes('banana'))
    return 'Fuente natural de potasio, magnesio, vitamina B6 y carbohidratos de energía rápida. Ideal pre-entrenamiento y para calambres musculares. Su fibra es prebiótica.';
  if (n.includes('kiwi'))
    return 'Uno de los alimentos con mayor concentración de vitamina C. Rico en vitamina K, folato, potasio y actinidina (enzima que mejora la digestión de proteínas).';

  // Genéricos por categoría
  if (c.includes('aceite')) return 'Fuente de grasas saludables esenciales para la absorción de vitaminas liposolubles y la función celular. Prioriza siempre las variedades vírgenes o virgen extra.';
  if (c.includes('frutos secos')) return 'Los frutos secos naturales (sin sal ni azúcar añadida) concentran grasas saludables, proteínas, fibra y micronutrientes esenciales en pequeñas raciones.';
  if (c.includes('pescado') || c.includes('marisco')) return 'Proteína de alta calidad, bajo en grasas saturadas y rico en minerales como yodo, selenio y zinc. Consumir al menos 2-3 veces por semana según las recomendaciones dietéticas.';
  if (c.includes('huevo') || c.includes('leche')) return 'Alimento de alta densidad nutricional con proteínas completas, calcio, vitaminas y minerales esenciales para huesos, músculos y sistema nervioso.';
  if (c.includes('yogur') || c.includes('postre')) return 'Los lácteos fermentados aportan probióticos beneficiosos para la microbiota intestinal, además de calcio, proteínas y vitaminas del grupo B.';
  if (c.includes('aves') || c.includes('pollo')) return 'Proteína animal magra y baja en grasas saturadas. Fuente de vitaminas del grupo B, fósforo y selenio. Eje de dietas equilibradas y planes de entrenamiento.';
  if (c.includes('legumbre')) return 'Las legumbres son la base proteica vegetal de la dieta mediterránea. Ricas en fibra, hierro, folato y carbohidratos complejos. Recomendadas 3-4 veces por semana.';
  if (c.includes('cereal') || c.includes('arroz')) return 'Los cereales integrales mantienen el salvado y el germen con fibra, vitaminas B y minerales que se pierden en el refinado. Prioriza siempre la versión integral.';
  if (c.includes('fruta') || c.includes('verdura')) return 'Fuente esencial de vitaminas, minerales, fibra y antioxidantes. Bajo en calorías y fundamental para la prevención de enfermedades crónicas. Al menos 5 raciones diarias.';

  // Nuevas categorías
  if (n.includes('vinagre de manzana')) return 'El vinagre de manzana contiene ácido acético que ayuda a regular la glucemia post-comida, mejora la digestión y tiene propiedades antimicrobianas. Excelente para aliñar sin calorías.';
  if (n.includes('vinagre balsámico') || n.includes('balsámico')) return 'Rico en antioxidantes (polifenoles). Da sabor intenso con muy pocas calorías. La versión de Módena auténtica contiene más compuestos bioactivos.';
  if (n.includes('vinagre')) return 'El vinagre es un condimento sin calorías que ayuda a reducir el índice glucémico de las comidas. Con propiedades digestivas y antimicrobianas.';
  if (n.includes('sal rosa') || n.includes('himalaya')) return 'Aporta más de 80 minerales traza en pequeñas cantidades. Tiene menor contenido de sodio que la sal común por su estructura cristalina. Úsala con moderación como cualquier sal.';
  if (n.includes('sal yodada')) return 'La sal yodada previene la deficiencia de yodo, esencial para la función tiroidea. El yodo es especialmente importante durante el embarazo y la infancia.';
  if (n.includes('orégano') || n.includes('oregano')) return 'El orégano tiene una de las mayores concentraciones de antioxidantes entre las hierbas. Contiene carvacrol y timol con potentes propiedades antimicrobianas y antiinflamatorias.';
  if (n.includes('cúrcuma') || n.includes('curcuma')) return 'La curcumina es uno de los antiinflamatorios naturales más potentes conocidos. Se absorbe mejor combinada con pimienta negra y grasa. Antiinflamatoria, antioxidante y neuroprotectora.';
  if (n.includes('jengibre')) return 'El jengibre contiene gingeroles y shogaoles con potentes efectos antiinflamatorios, antinauseosos y digestivos. Mejora la circulación y tiene propiedades inmunoestimulantes.';
  if (n.includes('canela')) return 'La canela de Ceilán regula los niveles de azúcar en sangre mejorando la sensibilidad a la insulina. Antioxidante, antiinflamatoria y con propiedades antimicrobianas.';
  if (n.includes('pimienta negra') || n.includes('pimienta')) return 'La piperina de la pimienta negra aumenta hasta un 2000% la absorción de curcumina del cúrcuma. Estimula la digestión y tiene propiedades antioxidantes y antiinflamatorias.';
  if (n.includes('laurel')) return 'El laurel contiene eugenol y ácido láurico con propiedades antiinflamatorias y digestivas. Facilita la digestión de legumbres y reduce los gases.';
  if (n.includes('albahaca')) return 'Rica en vitamina K, vitamina A y antioxidantes (flavonoides). Sus aceites esenciales tienen propiedades antibacterianas y antiinflamatorias.';
  if (n.includes('tomillo')) return 'El tomillo contiene timol, uno de los antibacterianos naturales más potentes. Expectorante y antiinflamatorio de las vías respiratorias. Rico en vitamina C y hierro.';
  if (n.includes('hierbas provenzales')) return 'Mezcla de hierbas mediterráneas (tomillo, romero, orégano, lavanda) con sinergia antioxidante y antiinflamatoria. Realzan el sabor de carnes, verduras y legumbres.';
  if (n.includes('romero')) return 'El ácido rosmarínico y el carnosol del romero son potentes antioxidantes y neuroprotectores. Mejora la memoria y la concentración. Antiinflamatorio y digestivo.';
  if (n.includes('jamón serrano') || n.includes('jamón ibérico') || (n.includes('jamón') && !n.includes('cocido'))) return 'El jamón ibérico de bellota es rico en ácido oleico (como el AOVE), vitaminas B1, B12 y zinc. El serrano aporta proteína de calidad, hierro hem y selenio. Consumo moderado.';
  if (n.includes('pechuga de pavo') || (n.includes('pavo') && n.includes('lonchas'))) return 'La pechuga de pavo en lonchas es una de las charcuterías más magras: alto en proteína, bajo en grasa y sal (en versiones naturales). Ideal para bocadillos proteicos.';
  if (n.includes('queso curado') || n.includes('manchego') || n.includes('parmesano')) return 'Los quesos curados concentran proteínas, calcio, fósforo y vitamina K2 (esencial para la salud ósea y cardiovascular). Consumo moderado por su contenido en sal y grasa saturada.';
  if (n.includes('queso semicurado') || n.includes('queso tierno')) return 'Equilibrio entre frescura y curación: proteínas, calcio y vitaminas del grupo B. Más suave que los curados con menos sal. Buen aporte de fósforo para la salud ósea.';
  if (n.includes('gazpacho')) return 'El gazpacho es un superalimento líquido: tomate, aceite de oliva, ajo, pimiento, pepino y vinagre combinan licopeno, vitamina C, E y antioxidantes. Hidratante y bajo en calorías.';
  if (n.includes('salmorejo')) return 'Versión más densa del gazpacho, rico en licopeno, vitamina C y antioxidantes del tomate. El AOVE añade grasas saludables y potencia la absorción de licopeno.';
  if (n.includes('crema de verduras') || n.includes('crema de calabaza') || n.includes('crema de zanahoria')) return 'Las cremas de verduras son una forma práctica de consumir vegetales con todos sus nutrientes. Ricas en betacarotenos, vitamina C y fibra. Bajas en calorías y muy saciantes.';
  if (n.includes('caldo')) return 'El caldo vegetal o de pollo natural aporta minerales, colágeno (si es de huesos) y compuestos bioactivos beneficiosos para las articulaciones y la digestión. Base de cocina saludable.';
  if (n.includes('tomate triturado') || n.includes('tomate natural') || n.includes('tomate frito')) return 'El tomate cocinado tiene mayor disponibilidad de licopeno que el crudo. El tomate frito con AOVE multiplica la absorción de este antioxidante con propiedades anticancerígenas.';
  if (n.includes('pasta integral') || (n.includes('pasta') && n.includes('integral'))) return 'La pasta integral conserva el salvado con fibra, vitaminas B y menor índice glucémico que la pasta blanca. Más saciante y con mejor impacto en el azúcar en sangre.';
  if (n.includes('pasta') || n.includes('fideo') || n.includes('macarrón') || n.includes('espagueti')) return 'La pasta proporciona carbohidratos complejos de energía sostenida. Elige siempre versiones integrales para obtener más fibra y menor índice glucémico.';
  if (n.includes('tortita de arroz') || n.includes('tortita de maíz') || n.includes('tortita')) return 'Las tortitas de arroz o maíz son snacks sin grasas trans, bajos en calorías y sin gluten (arroz). Aportan carbohidratos de liberación media. Elige sin sal añadida.';
  if (n.includes('tofu')) return 'El tofu es proteína vegetal completa: todos los aminoácidos esenciales, calcio, hierro y magnesio. Bajo en calorías y muy versátil. La versión firme es ideal para cocinar.';
  if (n.includes('edamame')) return 'Las judías de soja tiernas son una de las proteínas vegetales más completas. Ricas en fibra, folato, vitamina K y todos los aminoácidos esenciales. Snack proteico natural.';
  if (n.includes('soja') || n.includes('proteína vegetal')) return 'La soja texturizada es proteína vegetal completa, con todos los aminoácidos esenciales, rica en fibra y hierro. Base de platos vegetarianos saciantes y económicos.';
  if (n.includes('bebida de avena') || n.includes('bebida vegetal') || n.includes('bebida de soja')) return 'Alternativa vegetal a la leche, enriquecida con calcio y vitamina D. Sin lactosa, ideal para intolerantes. La de soja tiene el mejor perfil proteico de las bebidas vegetales.';
  if (n.includes('bífidus')) return 'El bífidus es un yogur enriquecido con bifidobacterias: probióticos que regulan el tránsito intestinal, refuerzan el sistema inmune y mejoran la absorción de nutrientes.';
  if (n.includes('kéfir') || n.includes('kefir')) return 'Bebida fermentada con mayor diversidad de probióticos que el yogur. Mejora la salud intestinal, la inmunidad y puede ser tolerada por intolerantes a la lactosa leves.';
  if (n.includes('mermelada') && n.includes('sin azúcar')) return 'Las mermeladas sin azúcar añadido usan frutas como única fuente de dulzor. Aportan fibra de la fruta y antioxidantes con un impacto glucémico menor que las versiones azucaradas.';
  if (n.includes('harina integral') || (n.includes('harina') && n.includes('integral'))) return 'La harina integral conserva el salvado y el germen con fibra, vitaminas B, hierro y zinc. Úsala para hacer pan casero más nutritivo y saciante.';
  if (n.includes('harina de avena') || n.includes('harina de almendra')) return 'Harinas alternativas con mayor contenido proteico y fibra que la harina de trigo refinada. La harina de avena tiene beta-glucanos que reducen el colesterol.';
  if (n.includes('altramuz') || n.includes('altramuces')) return 'El altramuz es la legumbre con mayor contenido proteico (36g/100g) y fibra. Bajo en carbohidratos, ideal para dietas bajas en azúcar. Rico en arginina que mejora la circulación.';
  if (n.includes('boquerón') || n.includes('anchoa')) return 'Los boquerones y anchoas son pescado azul con altísimo contenido en omega-3, calcio (con espina), vitamina D y B12. Las anchoas en aceite de oliva son un superalimento concentrado.';
  if (n.includes('arroz basmati')) return 'El arroz basmati tiene un índice glucémico más bajo que el arroz blanco común gracias a su mayor contenido en amilosa. Se digiere bien, no provoca picos bruscos de azúcar y resulta especialmente ligero y aromático.';
  if (n.includes('nuez de brasil') || n.includes('nuez brasil')) return 'La nuez de Brasil es la fuente alimentaria más rica en selenio: una sola nuez cubre el 100% de la ingesta diaria recomendada. El selenio es esencial para la función tiroidea, la inmunidad y como antioxidante celular potente.';
  if (n.includes('pipa de calabaza') || n.includes('pipas de calabaza') || n.includes('semilla de calabaza')) return 'Las pipas de calabaza destacan por su alto contenido en zinc (inmunidad, fertilidad, piel), magnesio, proteínas vegetales y triptófano. Su aceite tiene propiedades antiinflamatorias y beneficios para la salud prostática.';
  if (n.includes('lomo embuchado') || n.includes('lomo curado')) return 'El lomo embuchado es el embutido curado más magro: alto en proteína y bajo en grasa comparado con otros embutidos. Aporta vitaminas B1, B12, zinc y hierro hem de alta absorción. Consumo moderado por su contenido en sal.';
  if (n.includes('burrata') || n.includes('mozzarella')) return 'La mozzarella y la burrata son quesos frescos con alto contenido en proteínas, calcio y fósforo, y baja cantidad de sal respecto a quesos curados. La burrata añade crema en su interior, fuente de vitaminas liposolubles A y D.';
  if (n.includes('feta')) return 'El queso feta es rico en calcio, proteínas y vitaminas B. Tiene propiedades probióticas por su fermentación tradicional y contiene ácido linoleico conjugado (CLA) con beneficios antiinflamatorios. Intenso en sabor, se usa en poca cantidad.';
  if (n.includes('ricota') || n.includes('ricotta')) return 'La ricota es uno de los quesos más ligeros: muy alta en proteína de suero (whey), baja en grasa y calorías. El suero lácteo que la compone aporta aminoácidos esenciales de alta biodisponibilidad. Ideal en dietas de control de peso.';
  if (n.includes('requesón')) return 'El requesón es bajo en grasa, alto en proteínas de calidad y calcio. Muy fácil de digerir, con mínimo contenido en lactosa. Versátil para platos dulces y salados. Perfecto para deportistas y personas que cuidan el aporte calórico.';
  if (n.includes('parmesano') || n.includes('queso rallado')) return 'El parmesano concentra proteínas, calcio y vitamina K2 (clave para la salud ósea y cardiovascular). Su largo proceso de curación elimina prácticamente la lactosa. Intenso en sabor umami, se usa en pequeñas cantidades con gran impacto.';
  if (n.includes('queso crema') || n.includes('crema de queso')) return 'El queso crema aporta proteínas, calcio y vitaminas A y D. Más ligero que la mantequilla, es una alternativa para untar con mejor perfil nutricional. Las versiones light reducen la grasa manteniendo las proteínas.';
  if (n.includes('carne picada') && (n.includes('vacuno') || n.includes('ternera') || n.includes('vaca'))) return 'La carne picada de vacuno es fuente excelente de proteína completa, hierro hem de alta biodisponibilidad, zinc y vitamina B12. Elige versiones con bajo porcentaje graso (≤10%). El hierro hem de la ternera es insustituible para prevenir la anemia ferropénica.';
  if (n.includes('burger') && n.includes('pollo')) return 'La hamburguesa de pollo campero es una proteína magra de alta calidad, más baja en grasa saturada que la de vacuno. El pollo campero tiene mejor perfil de ácidos grasos y mayor contenido en omega-3 que el de granja convencional.';
  if (n.includes('queso fresco batido') || (n.includes('queso') && n.includes('batido'))) return 'El queso fresco batido 0% es una de las mejores fuentes proteicas bajas en grasa: altísimo en proteína, prácticamente sin grasa y con buen aporte de calcio. Textura cremosa ideal para batidos, salsas y desayunos proteicos.';
  if (n.includes('postre de coco') || (n.includes('coco') && n.includes('alpro'))) return 'El postre de coco vegano aporta grasas de cadena media (MCT) del coco con metabolismo energético rápido. Sin lactosa y sin azúcares añadidos en versiones sin azúcar. Alternativa saludable para intolerantes a la lactosa con antojo de algo dulce.';
  if (n.includes('skyr')) return 'El skyr es un lácteo fermentado islandés con hasta 3 veces más proteína que el yogur convencional, bajo en grasa y azúcar. Sus cultivos vivos actúan como probióticos. Ideal para deportistas y como merienda saciante de alto valor proteico.';

  return 'Alimento de calidad con importantes propiedades nutricionales. Incluirlo regularmente en una dieta variada y equilibrada contribuye al bienestar general.';
}

// ── Secciones de la guía (11 secciones según índice del usuario) ─────────────
// buscarCatExacta: busca por nombre en el mapa de subcategorías
// buscarCatId: usa IDs directos (para evitar colisiones de nombres duplicados)
// excluirIds: Set de IDs a eliminar explícitamente
// incluirBusquedas: términos para buscar productos adicionales vía API search
const SECCIONES_GUIA = [
  // ── 1. Aceites, especias y salsas ──────────────────────────────────────────
  {
    titulo: '1. Aceites, Especias y Salsas',
    intro: 'El aceite de oliva virgen extra (AOVE), pilar de la dieta mediterránea, concentra polifenoles, vitamina E y ácido oleico. Las especias son la farmacia natural de la cocina: antiinflamatorias, antioxidantes y digestivas sin calorías.',
    buscarCatExacta: ['aceite, vinagre y sal', 'especias'],
    filtroProducto: (p) => {
      const n = p.display_name.toLowerCase();
      if (n.includes('aceite') && !n.includes('oliva') && !n.includes('coco')) return false;
      if (n.includes('mayonesa') || n.includes('ketchup') || n.includes('mostaza')) return false;
      if (n.includes('adobo') || n.includes('condimento para')) return false;
      return true;
    },
    excluirIds: new Set(['4240', '4241', '4640', '4641', '4749', '4711', '4908', '34182']),
    incluirIds: new Set([
      '4193',  // Aceite de coco virgen Hacendado
      '35343', // Salsa de tomate Zero sin azúcares añadidos
      '17228', // Mostaza de Dijon Hacendado
      '23410', // Mostaza clásica Hacendado
      '52859', // Salsa de tomate con Albahaca Hacendado
      '17360', // Salsa de Soja Hacendado
      '17382', // Salsa de Soja sin gluten Hacendado
      '3840',  // Guacamole Hacendado
      '16827', // Salsa Mexicana Hacendado
      '17441', // Pasta de sésamo Tahini Hacendado
    ]),
    maxProductos: 25,
    maxPorSubcat: 15
  },
  // ── 2. Frutos secos, semillas y encurtidos ─────────────────────────────────
  {
    titulo: '2. Frutos Secos, Semillas y Encurtidos',
    intro: 'Los frutos secos naturales concentran omega-3, proteínas y fibra. Las semillas de chía, lino y calabaza son superalimentos ricos en omega-3 vegetal, zinc y fibra soluble. Las aceitunas aportan MUFA y polifenoles.',
    buscarCatExacta: ['frutos secos y fruta desecada', 'aceitunas y encurtidos'],
    filtroProducto: (p) => {
      const n = p.display_name.toLowerCase();
      if (n.includes('miel') || n.includes('garrapiñad') || n.includes('turrón') || n.includes('salsa')) return false;
      if (n.includes('cocktail') || n.includes('palomitas') || n.includes('maíz')) return false;
      if (n.includes('pasas') || n.includes('orejones') || n.includes('piña deshidratada') || n.includes('mango deshidratado') || n.includes('ciruelas desecadas')) return false;
      return true;
    },
    // 34079=pipas sal, 34822=palomitas sal, 14347=palomitas, 34212=palomitas mantequilla, 34817=palomitas dulces
    // 34820=cacahuete frito sal, 34868=cacahuete frito salado, 34027=anacardo frito sal
    // 34145=pipas girasol fritas, 34043=pipas girasol barbacoa, 80492=almendra marcona frita sal
    // 23575=almendra natural sin piel (duplicada), 34016=cacahuete tostado sal (tercer cacahuete)
    excluirIds: new Set(['34079','34822','14347','34212','34817','34820','34868','34027','34145','34043','80492','23575','34016']),
    incluirIds: new Set([
      '33190', // Alcaparras Hacendado
      '34209', // Mango deshidratado Hacendado
      '16663', // Piña deshidratada Hacendado
      '15301', // Dátiles desecados sin hueso Hacendado
      '22974', // Dátiles Medjoul con hueso Hacendado
      '33053', // Aceitunas verdes sin hueso Hacendado
      '52734', // Aceitunas negras sin hueso Hacendado
      '33022', // Ajos aliñados Hacendado
      '29540', // Pepinillos pequeños Hacendado
    ]),
    maxProductos: 30,
    maxPorSubcat: 50
  },
  // ── 3. Arroz, legumbres y pasta ────────────────────────────────────────────
  {
    titulo: '3. Arroz, Legumbres y Pasta',
    intro: 'Las legumbres son la proteína vegetal de referencia de la dieta mediterránea. El arroz basmati estabiliza la glucemia. La pasta integral y de legumbres multiplica el aporte proteico y de fibra.',
    buscarCatExacta: ['arroz', 'legumbres', 'pasta y fideos'],
    filtroProducto: (p) => {
      const n = p.display_name.toLowerCase();
      // Pasta: solo integral, espelta o pasta de legumbres
      if ((n.includes('fideo') || n.includes('fideuá') || n.includes('pasta')) &&
          !n.includes('integral') && !n.includes('espelta') &&
          !n.includes('lenteja') && !n.includes('garbanzo') && !n.includes('legumbre') &&
          !n.includes('vegetal') && !n.includes('guisante')) return false;
      return true;
    },
    incluirIds: new Set([
      '6106',  // Pasta fusilli 100% lentejas rojas Felicia
      '35981', // Noodles de arroz Hacendado
    ]),
    maxProductos: 25,
    maxPorSubcat: 15
  },
  // ── 4. Panes y harinas ─────────────────────────────────────────────────────
  {
    titulo: '4. Panes y Harinas',
    intro: 'El pan integral conserva el salvado con fibra, vitaminas B y menor índice glucémico. La espelta y el centeno son los cereales más nutritivos para pan. Elige siempre versiones 100% integrales.',
    buscarCatExacta: ['pan de molde y otras especialidades', 'pan tostado y rallado', 'pan de horno'],
    filtroProducto: (p) => {
      const n = p.display_name.toLowerCase();
      if (n.includes('bollería') || n.includes('tarta') || n.includes('pastel') || n.includes('churro')) return false;
      if (n.includes('pan tostado') && n.includes('classic') && !n.includes('integral') && !n.includes('semillas')) return false;
      if (n.includes('harina')) return false;
      if (n.includes('biscote') || n.includes('pan tostado')) return true;
      return n.includes('integral') || n.includes('centeno') || n.includes('semillas') || n.includes('multicereales') || n.includes('espelta') || n.includes('avena');
    },
    excluirIds: new Set([
      '83558', '82295', '83869', '82302', '83547', '9369', '82290', '82665', '86008', '82117', '82417', '13445', '83789',
      '80531',   // Tortillas de avena 51%
      '82190',   // Pan tostado con tomate
      '82199',   // Pan tostado con ajo y perejil
      '82626',   // Crackers integrales espelta Bachman
      '82412',   // Crackers 30% integral
      '21584',   // Galletas saladas semillas y orégano
      '15691.1', // Hogaza centeno 50%
      '83116',   // Pan mini semillas
      '83452',   // 5 Barras pan 51% integral
      '83284',   // Panecillo harina integral 50%
      '21576',   // Panecillo trigo integral 30%
      '83056',   // 6 Panes centeno 51%
      '15691.2', // Hogaza centeno 50% rebanado
      '82842',   // Pan tostado 100% espelta integral Hacendado
    ]),
    maxProductos: 20,
    maxPorSubcat: 15
  },
  // ── 5. Chocolates, cereales y tortitas ────────────────────────────────────
  {
    titulo: '5. Chocolates, Cereales y Tortitas',
    intro: 'El chocolate negro (>70% cacao) aporta flavonoides, magnesio y hierro. El cacao puro en polvo es la forma más concentrada. Los copos de avena son el desayuno más nutritivo. Las tortitas de maíz o arroz son snacks sin grasas trans.',
    buscarCatExacta: ['chocolate', 'cacao soluble y chocolate a la taza', 'cereales', 'tortitas'],
    filtroProducto: (p) => {
      const n = p.display_name.toLowerCase();
      if ((n.includes('chocolate') || n.includes('tableta')) && !n.includes('negro') && !n.includes('puro') && !n.includes('70') && !n.includes('85') && !n.includes('90') && !n.includes('72') && !n.includes('99')) return false;
      if (n.includes('cacao soluble') || n.includes('nesquik') || n.includes('cola cao') || n.includes('colacao')) return false;
      if (n.includes('con miel') || n.includes('relleno') || n.includes('garrapiñad') || n.includes('chocolate y avellana')) return false;
      return true;
    },
    excluirIds: new Set([
      '12531', '40358', '12126', '12130', '12431', '12544', '22703', '12524', '12530', '12017', '11609',
      '35707',  // Special K Classic
      '35776',  // Tortitas maíz sabor jamón
      '14786',  // Tortitas maíz campestre
      '14158',  // Tortitas de maíz Hacendado
      '9210',   // Cereales Corn Flakes Kellogg's
    ]),
    incluirIds: new Set([
      '15611', // Cereales avena Crunchy Hacendado
      '9532',  // Cereales Cereal Mix Hacendado 0% azúcares añadidos
      '9571',  // Cereales copos de trigo espelta integral Hacendado
      '9488',  // Cereales copos de trigo integral y arroz Hacendado 0% azúcares añadidos
    ]),
    maxProductos: 20,
    maxPorSubcat: 5
  },
  // ── 6. Charcutería y quesos ────────────────────────────────────────────────
  {
    titulo: '6. Charcutería y Quesos',
    intro: 'El jamón ibérico de bellota concentra ácido oleico como el AOVE. El lomo embuchado es el embutido curado más magro. En quesos, prioriza los frescos (feta, mozzarella, ricota) y el curado por su vitamina K2.',
    buscarCatExacta: ['aves y jamón cocido', 'jamón serrano', 'embutido curado', 'queso untable, fresco y especialidades', 'queso curado, semicurado y tierno'],
    filtroProducto: (p) => {
      const n = p.display_name.toLowerCase();
      if (n.includes('chopped') || n.includes('mortadela') || n.includes('bacón') || n.includes('salchicha')) return false;
      if (n.includes('fuet') || n.includes('salchichón') || n.includes('sobrasada') || n.includes('paté')) return false;
      if (n.includes('fundido') || n.includes('americano') || n.includes('burger')) return false;
      if (n.includes('chorizo') || n.includes('salami') || n.includes('longaniza') || n.includes('pepperoni')) return false;
      return true;
    },
    excluirIds: new Set([
      '86786', '67972', '60244', '56619', '56169', '53140', '59283', '59218', '55136',
      '60243',  // Pechuga pavo reducido sal Hacendado
      '58230',  // Surtido ibéricos La Hacienda
      '21601',  // Lomo cerdo cocido Hacendado
      '51181',  // Crema queso camembert
      '51167',  // Mousse queso vaca ajo finas hierbas
      '51208',  // Queso untar vaca finas hierbas
      '51211',  // Queso untar queso azul
      '22780',  // Crema queso viejo tostado mezcla
    ]),
    incluirIds: new Set([
      '59256', // Jamón cocido Hacendado lonchas
    ]),
    maxProductos: 35,
    maxPorSubcat: 12
  },
  // ── 7. Congelados ──────────────────────────────────────────────────────────
  {
    titulo: '7. Congelados',
    intro: 'Los congelados de calidad conservan nutrientes tan bien como los frescos. Frutas del bosque, verduras, pescado y marisco congelados son la mejor opción práctica sin conservantes artificiales.',
    buscarCatId: [145, 149, 150],
    filtroProducto: (p) => {
      const n = p.display_name.toLowerCase();
      return !n.includes('pizza') && !n.includes('rebozado') && !n.includes('croqueta')
        && !n.includes('nugget') && !n.includes('empanado') && !n.includes('frito')
        && !n.includes('helado') && !n.includes('tarta') && !n.includes('churro')
        && !n.includes('paella') && !n.includes('preparado') && !n.includes('plato')
        && !n.includes('lasaña') && !n.includes('canelón');
    },
    maxProductos: 25,
    maxPorSubcat: 15
  },
  // ── 8. Conservas, caldos y cremas ──────────────────────────────────────────
  {
    titulo: '8. Conservas, Caldos y Cremas',
    intro: 'Las conservas de calidad son aliadas de la cocina saludable. El atún y bonito en aceite de oliva, los berberechos al natural y el gazpacho concentran nutrientes sin procesado excesivo.',
    buscarCatExacta: ['atún y otras conservas de pescado', 'berberechos y mejillones', 'gazpacho y cremas', 'tomate', 'sopa y caldo'],
    filtroProducto: (p) => {
      const n = p.display_name.toLowerCase();
      if (n.includes('gallina blanca') || n.includes('knorr') || n.includes('maggi') || n.includes('sobre')) return false;
      if (n.includes('atún') && n.includes('aceite de girasol') && !n.includes('oliva')) return false;
      if (n.includes('ensaladilla') || n.includes('paté') || n.includes('pasta de')) return false;
      if (n.includes('tomate frito')) return false;
      return true;
    },
    excluirIds: new Set(['18031', '18615', '18619', '18602', '18621', '18622', '13632', '23531', '13499', '23264', '17132', '17151', '17108']),
    incluirIds: new Set([
      '16712', // Maíz dulce Hacendado
      '16519', // Espárragos blancos medianos Hacendado
      '16124', // Pimientos rojos asados Hacendado en tiras extra
      '16416', // Guisantes extra Hacendado
      '16315', // Judías verdes redondas Hacendado
      '15534', // Patatas cocidas Hacendado
      '16711', // Palmito al natural entero Hacendado
      '7024',  // Caldo de pollo casero Gallina Blanca
      '16012', // Tomate tamizado sin piel Hacendado
      '16074', // Tomate doble concentrado Hacendado extra
    ]),
    maxProductos: 25,
    maxPorSubcat: 15
  },
  // ── 9. Carne, pescado y huevos ─────────────────────────────────────────────
  {
    titulo: '9. Carne, Pescado y Huevos',
    intro: 'Proteínas animales completas con todos los aminoácidos esenciales. El pescado azul aporta omega-3 EPA/DHA. El pollo y pavo son proteínas magras ideales. El huevo es el alimento proteico de referencia. La ternera magra aporta hierro hem de alta absorción.',
    buscarCatExacta: ['aves y pollo', 'hamburguesas y picadas', 'pescado fresco', 'salazones y ahumados', 'huevos'],
    filtroProducto: (p) => {
      const n = p.display_name.toLowerCase();
      if (n.includes('rebozado') || n.includes('frito') || n.includes('nugget')) return false;
      if (n.includes('croqueta') || n.includes('empanado') || n.includes('paella')) return false;
      if (n.includes('elaborado') || n.includes('marinado con')) return false;
      if (n.includes('albóndiga') || n.includes('albondiga')) return false;
      // En hamburguesas/picadas: solo vacuno puro o pollo, no mezclas con cerdo
      if (n.includes('vacuno y cerdo') || n.includes('cerdo y cebolla') || n.includes('pavo y espinacas')) return false;
      if (n.includes('cordero') || n.includes('conejo') || n.includes('crunchy')) return false;
      if (n.includes('preparado de carne picada cerdo')) return false;
      return true;
    },
    excluirIds: new Set([
      '35396', '2796', '25629', '14031',
      '3400', '2786', '3682', '3724',
      '9995', '4109',
      '81649.4', '81649.2', '81649.5', '81649.3', '81649.6',
      '87208', '87204', '87203', '87205',
      '52672',  // Burger de cerdo
      '3979',   // Burger americana gruesas
      '8840',   // Burger de vaca madurada
      '8839',   // Burger de cordero
      '10453',  // Mini burgers vacuno y cerdo
      '4155',   // Burger vacuno y cerdo con jamón
      '2873',   // Burger de vacuno
      '3547',   // Burger de vacuno gruesas
      '35884',  // Hamburguesa lomo de vacuno
      '2868',   // Preparado carne picada vacuno
      '3454',   // Preparado carne picada vacuno
      '52776',  // Preparado carne picada vacuno
      '35774',  // Preparado carne picada pollo
      '18407',  // Filetes anchoa aceite girasol
      '80405',  // Boquerones vinagre aceite girasol (pack)
      '23122',  // Boquerones al vinagre aceite girasol
      '18808',  // Sucedáneo caviar negro Ubago
      '52451',  // Boquerones aliñados Hacendado
      '13787',  // Bacalao ahumado aceite girasol
      '80412',  // Filetes sardina marinada aceite oliva virgen extra
      '31592',  // Huevos super grandes XL
      '31504',  // Huevos grandes L
      '31505',  // Huevos medianos M
      '30167',  // Huevos (pack genérico)
      '31540',  // Huevos grandes L (variante)
      '31011',  // Huevos de codorniz
    ]),
    maxProductos: 25,
    maxPorSubcat: 15
  },
  // ── 10. Proteínas vegetales ────────────────────────────────────────────────
  {
    titulo: '10. Proteínas Vegetales',
    intro: 'La soja texturizada y el tofu son las proteínas vegetales más completas: todos los aminoácidos esenciales, hierro, calcio y fitoestrógenos. Ideales para complementar o sustituir la proteína animal en cualquier plato.',
    buscarCatId: [121, 142],
    filtroProducto: (p) => {
      const n = p.display_name.toLowerCase();
      if (n.includes('garbanzo') || n.includes('lenteja') || n.includes('alubia') || n.includes('judía') || n.includes('guisante')) return false;
      if (n.includes('ensaladilla') || n.includes('patatas') || n.includes('sándwich') || n.includes('pastel')) return false;
      if (n.includes('salmorejo') || n.includes('gazpacho') || n.includes('tabulé') || n.includes('tsatsiki')) return false;
      return true;
    },
    maxProductos: 10,
    maxPorSubcat: 5
  },
  // ── 11. Postres y yogures ──────────────────────────────────────────────────
  {
    titulo: '11. Postres y Yogures',
    intro: 'El yogur natural y el kéfir son los lácteos fermentados más saludables: calcio, proteínas y probióticos. El queso fresco batido 0% es una fuente proteica excelente y baja en grasa. Elige siempre versiones sin azúcares añadidos.',
    buscarCatExacta: ['yogures naturales y sabores', 'yogures desnatados', 'yogures griegos', 'bífidus', 'postres de soja'],
    filtroProducto: (p) => {
      const n = p.display_name.toLowerCase();
      if (n.includes('chocolate') || n.includes('flan') || n.includes('natillas') || n.includes('mousse') || n.includes('gelatina')) return false;
      if (n.includes('stracciatella') || n.includes('con azúcar de caña') || n.includes('sabor fresa') || n.includes('sabor limón')) return false;
      // Excluir postres de soja excepto postre de coco alpro
      if (n.includes('postre de soja') || (n.includes('postre') && !n.includes('coco'))) return false;
      if (n.includes('leche')) return false;
      if (n.includes('láctea') || n.includes('lactea')) return false;
      return true;
    },
    excluirIds: new Set([
      '20001', '20033', '20376', '20379', '20037', '20032', '20221', '20210', '13951', '20531', '21160', '21329', '21318',
      '52855',  // Postre lácteo sabor coco +Proteínas Hacendado
      '21330',  // Bífidus frutos silvestres
      '21327',  // Bífidus cereales y fibras
      '21332',  // Bífidus piña
      '21331',  // Bífidus pera
      '21311',  // Bífidus mango
      '21312',  // Bífidus ciruelas pasas
    ]),
    incluirIds: new Set([
      '21256', // Postre lácteo natural +Proteínas Hacendado 0% MG
      '12753', // Bebida láctea desnatada sabor fresa y plátano +Proteínas Hacendado
      '15662', // Bebida Kéfir natural Hacendado 0% MG
    ]),
    maxProductos: 20,
    maxPorSubcat: 8
  }
];

// ── Utilidades API ───────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchJSON(url, retry = 0) {
  await sleep(150);
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' }
  });
  if (res.status === 403 && retry < 3) {
    console.log(`  ⏳ 403 en ${url.split('/').slice(-3).join('/')} — reintentando (${retry + 1}/3)...`);
    await sleep(2000 * (retry + 1));
    return fetchJSON(url, retry + 1);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} → ${url}`);
  return res.json();
}

async function fetchSearch(query) {
  const data = await fetchJSON(`${BASE}/search/?query=${encodeURIComponent(query)}&lang=es&wh=${WH}`);
  return (data.products || []);
}

async function descargarImagen(url, destino) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return false;
    const file = createWriteStream(destino);
    await pipeline(res.body, file);
    return true;
  } catch {
    return false;
  }
}

// ── Lógica principal ─────────────────────────────────────────────────────────
async function main() {
  console.log('Obteniendo categorías de Mercadona...');
  const catData = await fetchJSON(`${BASE}/categories/?lang=es&wh=${WH}`);

  // Construir mapa: nombre normalizado → {id, nombre, padre}
  const mapaSubcats = {};
  for (const cat of catData.results) {
    for (const sub of (cat.categories || [])) {
      mapaSubcats[sub.name.toLowerCase()] = { id: sub.id, nombre: sub.name, padre: cat.name };
    }
  }

  console.log(`Encontradas ${Object.keys(mapaSubcats).length} subcategorías.\n`);

  const todosProductos = [];
  const idsUsados = new Set(); // evitar duplicados entre secciones
  const secciones = [];

  for (const seccion of SECCIONES_GUIA) {
    console.log(`Procesando: ${seccion.titulo}`);

    // Buscar subcategorías por nombre exacto o por ID directo
    const subcatsEncontradas = [];
    if (seccion.buscarCatId) {
      for (const id of seccion.buscarCatId) {
        const match = Object.values(mapaSubcats).find(s => s.id === id);
        if (match && !subcatsEncontradas.find(s => s.id === id)) {
          subcatsEncontradas.push(match);
        } else if (!match) {
          // Fallback: construir entrada mínima
          subcatsEncontradas.push({ id, nombre: `cat-${id}`, padre: '' });
        }
      }
    } else {
      for (const termino of (seccion.buscarCatExacta || [])) {
        const match = mapaSubcats[termino.toLowerCase()];
        if (match && !subcatsEncontradas.find(s => s.id === match.id)) {
          subcatsEncontradas.push(match);
        }
      }
    }

    if (subcatsEncontradas.length === 0) {
      console.log(`  ⚠️  Sin categorías para: ${(seccion.buscarCatExacta || seccion.buscarCatId || []).join(', ')}`);
      continue;
    }

    console.log(`  Categorías: ${subcatsEncontradas.map(s => `${s.nombre}(${s.id})`).join(', ')}`);

    // Obtener productos
    let productosRaw = [];
    for (const subcat of subcatsEncontradas) {
      try {
        const data = await fetchJSON(`${BASE}/categories/${subcat.id}/?lang=es&wh=${WH}`);

        if (seccion.unoporSubSubcat && data.categories?.length > 0) {
          // Coger 1 producto de cada sub-subcategoría para máxima variedad
          for (const subsub of data.categories) {
            const prod = (subsub.products || []).find(p => !idsUsados.has(p.id) && seccion.filtroProducto(p));
            if (prod) productosRaw.push({ ...prod, _subcatNombre: subsub.name });
          }
        } else {
          const prods = (data.categories || []).flatMap(c => c.products || []).concat(data.products || []);
          const filtrados = prods
            .filter(p => !idsUsados.has(p.id) && seccion.filtroProducto(p))
            .slice(0, seccion.maxPorSubcat || 999);
          productosRaw.push(...filtrados.map(p => ({ ...p, _subcatNombre: subcat.nombre })));
        }
      } catch (e) {
        console.log(`  Error cat ${subcat.id}: ${e.message}`);
      }
    }

    // Aplicar exclusiones manuales por ID
    if (seccion.excluirIds) {
      productosRaw = productosRaw.filter(p => !seccion.excluirIds.has(String(p.id)));
    }

    // Deduplicar dentro de la sección y entre secciones (por ID y por nombre exacto)
    const vistoLocal = new Set();
    const nombresVistos = new Set();
    productosRaw = productosRaw.filter(p => {
      if (vistoLocal.has(p.id) || idsUsados.has(p.id)) return false;
      if (nombresVistos.has(p.display_name)) return false;
      vistoLocal.add(p.id);
      nombresVistos.add(p.display_name);
      return true;
    });

    // Añadir productos por ID explícito (incluirIds) — bypasan filtros y maxPorSubcat
    if (seccion.incluirIds) {
      for (const id of seccion.incluirIds) {
        const idStr = String(id);
        if (!idsUsados.has(idStr) && !vistoLocal.has(idStr)) {
          try {
            // Intentar primero sin warehouse, luego con mad1 como fallback
            let p;
            try { p = await fetchJSON(`${BASE}/products/${idStr}/?lang=es`); }
            catch { p = await fetchJSON(`${BASE}/products/${idStr}/?lang=es&wh=mad1`); }
            if (!nombresVistos.has(p.display_name)) {
              productosRaw.push({ ...p, _subcatNombre: seccion.titulo });
              vistoLocal.add(String(p.id));
              nombresVistos.add(p.display_name);
            }
          } catch (e) {
            console.log(`  Error incluirId ${id}: ${e.message}`);
          }
        }
      }
    }

    // Añadir productos desde búsquedas adicionales
    if (seccion.incluirBusquedas) {
      for (const termino of seccion.incluirBusquedas) {
        try {
          const encontrados = await fetchSearch(termino);
          for (const p of encontrados.slice(0, 8)) {
            if (!idsUsados.has(p.id) && !vistoLocal.has(p.id) && !nombresVistos.has(p.display_name)) {
              if (!seccion.filtroProducto || seccion.filtroProducto(p)) {
                productosRaw.push({ ...p, _subcatNombre: termino });
                vistoLocal.add(p.id);
                nombresVistos.add(p.display_name);
              }
            }
          }
        } catch (e) {
          console.log(`  Error búsqueda "${termino}": ${e.message}`);
        }
      }
    }

    // Deduplicar por tipo (primera palabra significativa del nombre) si se especifica
    let candidatos = productosRaw;
    if (seccion.deduplicarPorTipo) {
      const tiposVistos = new Set();
      candidatos = productosRaw.filter(p => {
        const palabras = p.display_name.toLowerCase().split(/\s+/)
          .filter(w => w.length > 3 && !['hacendado','natural','cocido','extra','grande','pequeño'].includes(w));
        const tipo = palabras[0] || p.display_name.split(' ')[0].toLowerCase();
        if (tiposVistos.has(tipo)) return false;
        tiposVistos.add(tipo);
        return true;
      });
    }
    // Los incluirIds van siempre al final, fuera del límite maxProductos
    const incluirIdsSet = seccion.incluirIds || new Set();
    const normales = candidatos.filter(p => !incluirIdsSet.has(String(p.id))).slice(0, seccion.maxProductos);
    const forzados = candidatos.filter(p => incluirIdsSet.has(String(p.id)));
    const seleccionados = [...normales, ...forzados];
    seleccionados.forEach(p => idsUsados.add(p.id));

    console.log(`  ${seleccionados.length} productos seleccionados`);

    // Obtener detalles completos
    const productosDetalle = [];
    for (const prod of seleccionados) {
      try {
        let detalle;
        try { detalle = await fetchJSON(`${BASE}/products/${prod.id}/?lang=es`); }
        catch { detalle = await fetchJSON(`${BASE}/products/${prod.id}/?lang=es&wh=mad1`); }
        productosDetalle.push({ ...detalle, _subcatNombre: prod._subcatNombre });
        console.log(`  ✓ ${detalle.display_name}`);
      } catch (e) {
        console.log(`  Error producto ${prod.id}: ${e.message}`);
      }
    }

    // Descargar imágenes
    for (const prod of productosDetalle) {
      const foto = prod.photos?.[0];
      if (foto?.regular) {
        const nombre = `${prod.id}-${(prod.slug || 'producto').substring(0, 40)}.jpg`;
        const destino = path.join(IMAGENES_DIR, nombre);
        const ok = await descargarImagen(foto.regular, destino);
        prod._imagenLocal = ok ? `imagenes/${nombre}` : null;
        if (ok) console.log(`  📸 ${nombre}`);
      }
    }

    todosProductos.push(...productosDetalle);
    secciones.push({ ...seccion, productos: productosDetalle });
    console.log('');
  }

  // ── Guardar JSON de respaldo ───────────────────────────────────────────────
  writeFileSync(
    path.join(__dirname, 'datos-productos.json'),
    JSON.stringify(todosProductos, null, 2),
    'utf8'
  );
  console.log(`✅ datos-productos.json — ${todosProductos.length} productos`);

  // ── Generar guia-mercadona.md ──────────────────────────────────────────────
  let md = `# Guía de Alimentos Saludables — Mercadona\n\n`;
  md += `> Guía curada de los mejores productos saludables de Mercadona, organizada por grupos de alimentos con descripción nutricional y beneficios para la salud.\n\n`;
  md += `---\n\n## Índice\n\n`;

  for (const sec of secciones) {
    if (!sec.productos || sec.productos.length === 0) continue;
    const ancla = sec.titulo.toLowerCase()
      .replace(/[^a-z0-9áéíóúñü .]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[áéíóúüñ]/g, c => ({'á':'a','é':'e','í':'i','ó':'o','ú':'u','ü':'u','ñ':'n'}[c]||c))
      .replace(/\./g, '');
    md += `- [${sec.titulo}](#${ancla})\n`;
  }

  md += `\n---\n\n`;

  for (const sec of secciones) {
    if (!sec.productos || sec.productos.length === 0) continue;
    md += `## ${sec.titulo}\n\n`;
    md += `${sec.intro}\n\n`;

    for (const prod of sec.productos) {
      const precio = prod.price_instructions?.unit_price
        ? `${prod.price_instructions.unit_price} €`
        : '';
      const tamano = prod.price_instructions?.unit_size;
      const formato_size = prod.price_instructions?.size_format;
      const formato = tamano && formato_size
        ? `${prod.packaging || ''} ${tamano}${formato_size}`.trim()
        : (prod.packaging || '');
      const ingredientes = prod.nutrition_information?.ingredients
        ?.replace(/<[^>]+>/g, '').trim() || prod.details?.legal_name || '—';
      const origen = prod.details?.origin || prod.origin || null;
      const beneficios = getBeneficios(prod.display_name, prod._subcatNombre || '');

      md += `### ${prod.display_name}\n\n`;
      if (prod._imagenLocal) md += `![${prod.display_name}](${prod._imagenLocal})\n\n`;

      md += `| | |\n|---|---|\n`;
      if (formato) md += `| **Formato** | ${formato} |\n`;
      if (precio) md += `| **Precio** | ${precio} / ud. |\n`;
      if (origen) md += `| **Origen** | ${origen} |\n`;
      md += `| **Ingredientes** | ${ingredientes} |\n\n`;
      md += `**Beneficios nutricionales:** ${beneficios}\n\n`;
      md += `---\n\n`;
    }
  }

  md += `*Guía generada con datos de tienda.mercadona.es (${new Date().toLocaleDateString('es-ES')}). Precios y disponibilidad sujetos a cambios según zona.*\n`;

  writeFileSync(path.join(__dirname, 'guia-mercadona.md'), md, 'utf8');
  console.log(`✅ guia-mercadona.md generado`);

  // ── Generar guia-mercadona.html ────────────────────────────────────────────
  const seccionEmojis = ['🫒','🥜','🍚','🍞','🍫','🥩','❄️','🥫','🥚','🌱','🥛'];
  let html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Guía Saludable Mercadona</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f0; color: #1a1a1a; }
  header { background: #1a3a2a; color: white; padding: 2.5rem 2rem 2rem; text-align: center; }
  header h1 { font-size: 2rem; font-weight: 700; letter-spacing: -0.5px; }
  header p { margin-top: 0.5rem; color: #9ec4a8; font-size: 0.95rem; }
  nav { background: #fff; border-bottom: 1px solid #e0e0d8; padding: 1rem 2rem; display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
  nav a { color: #1a3a2a; text-decoration: none; font-size: 0.8rem; font-weight: 600; padding: 0.3rem 0.7rem; border-radius: 20px; border: 1.5px solid #c5d9cc; transition: all 0.15s; white-space: nowrap; }
  nav a:hover { background: #1a3a2a; color: white; border-color: #1a3a2a; }
  main { max-width: 1400px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }
  .seccion { margin-bottom: 4rem; }
  .seccion-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.6rem; padding-bottom: 0.75rem; border-bottom: 2px solid #1a3a2a; }
  .seccion-header h2 { font-size: 1.5rem; font-weight: 700; color: #1a3a2a; }
  .seccion-emoji { font-size: 1.8rem; }
  .seccion-intro { color: #555; font-size: 0.92rem; line-height: 1.6; margin-bottom: 1.5rem; max-width: 900px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.25rem; }
  .card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.07); transition: transform 0.15s, box-shadow 0.15s; display: flex; flex-direction: column; }
  .card:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,0.11); }
  .card-img { width: 100%; aspect-ratio: 1; object-fit: contain; background: #f8f8f5; padding: 12px; }
  .card-img-placeholder { width: 100%; aspect-ratio: 1; background: #f0f0ea; display: flex; align-items: center; justify-content: center; font-size: 3rem; }
  .card-body { padding: 0.9rem 1rem 1rem; flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
  .card-name { font-weight: 700; font-size: 0.88rem; line-height: 1.35; color: #1a1a1a; }
  .card-meta { display: flex; gap: 0.4rem; flex-wrap: wrap; }
  .badge { font-size: 0.72rem; font-weight: 600; padding: 0.2rem 0.5rem; border-radius: 10px; }
  .badge-price { background: #e8f4ec; color: #1a3a2a; }
  .badge-origen { background: #f0ece8; color: #5a3a1a; }
  .card-ingredientes { font-size: 0.75rem; color: #777; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  .card-beneficios { font-size: 0.78rem; color: #2a5a3a; line-height: 1.45; border-top: 1px solid #eee; padding-top: 0.5rem; margin-top: auto; }
  footer { text-align: center; padding: 2rem; color: #999; font-size: 0.8rem; background: #fff; border-top: 1px solid #e8e8e0; }
  @media (max-width: 600px) { .grid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; } header h1 { font-size: 1.4rem; } }
</style>
</head>
<body>
<header>
  <h1>🛒 Guía de Alimentos Saludables — Mercadona</h1>
  <p>Guía curada con ${todosProductos.length} productos organizados por grupos de alimentos</p>
</header>
<nav>\n`;

  secciones.forEach((sec, i) => {
    if (!sec.productos?.length) return;
    const ancla = sec.titulo.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
    html += `  <a href="#${ancla}">${seccionEmojis[i]||''} ${sec.titulo}</a>\n`;
  });
  html += `</nav>\n<main>\n`;

  secciones.forEach((sec, i) => {
    if (!sec.productos?.length) return;
    const ancla = sec.titulo.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
    html += `<section class="seccion" id="${ancla}">\n`;
    html += `  <div class="seccion-header"><span class="seccion-emoji">${seccionEmojis[i]||'🍽️'}</span><h2>${sec.titulo}</h2></div>\n`;
    html += `  <p class="seccion-intro">${sec.intro}</p>\n`;
    html += `  <div class="grid">\n`;

    for (const prod of sec.productos) {
      const precio = prod.price_instructions?.unit_price ? `${prod.price_instructions.unit_price} €` : null;
      const origen = prod.details?.origin || prod.origin || null;
      const ingredientes = (prod.nutrition_information?.ingredients || prod.details?.legal_name || '')
        .replace(/<[^>]+>/g, '').trim();
      const beneficios = getBeneficios(prod.display_name, prod._subcatNombre || '');
      const imgSrc = prod._imagenLocal || '';

      html += `    <div class="card">\n`;
      if (imgSrc) {
        html += `      <img class="card-img" src="${imgSrc}" alt="${prod.display_name}" loading="lazy">\n`;
      } else {
        html += `      <div class="card-img-placeholder">🛒</div>\n`;
      }
      html += `      <div class="card-body">\n`;
      html += `        <div class="card-name">${prod.display_name}</div>\n`;
      html += `        <div class="card-meta">\n`;
      if (precio) html += `          <span class="badge badge-price">${precio}</span>\n`;
      if (origen) html += `          <span class="badge badge-origen">📍 ${origen}</span>\n`;
      html += `        </div>\n`;
      if (ingredientes) html += `        <div class="card-ingredientes">${ingredientes}</div>\n`;
      html += `        <div class="card-beneficios">✅ ${beneficios}</div>\n`;
      html += `      </div>\n    </div>\n`;
    }

    html += `  </div>\n</section>\n\n`;
  });

  html += `</main>
<footer>Datos obtenidos de tienda.mercadona.es · ${new Date().toLocaleDateString('es-ES')} · Precios y disponibilidad sujetos a cambios</footer>
</body>
</html>`;

  writeFileSync(path.join(__dirname, 'guia-mercadona.html'), html, 'utf8');
  console.log(`✅ guia-mercadona.html generado`);
  console.log(`📁 Imágenes: ${IMAGENES_DIR}`);
  console.log(`\n🎉 ¡Listo! Contenido en guia-mercadona.md + guia-mercadona.html + imágenes en /imagenes/ listas para Canva.`);
}

main().catch(err => { console.error('Error fatal:', err); process.exit(1); });
