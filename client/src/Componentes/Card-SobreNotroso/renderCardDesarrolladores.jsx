import CardDesarrolladores from "./cardDesarrolladores";

const perfil = {
  nombre: "Sinthia Gonzalez",
  ocupacion: "Full Stack Developer",
  imagen: "https://avatars.githubusercontent.com/u/128981283?v=4",
  imagenFondo:
    "https://cf.bstatic.com/xdata/images/hotel/max1024x768/283384657.jpg?k=82f12511a23fc911e79146601860d7ae7b9839f37af39918d1312edd9d98efee&o=&hp=1",
  github: "https://github.com/SinthiaGonzalez",
  linkedin: "https://www.linkedin.com/in/sinthiagonzalez/",
};

const RenderCardDesarrolladores = () => {
  return (
    <div className="bg-white px-14 flex justify-center">
      <CardDesarrolladores {...perfil} />
    </div>
  );
};
export default RenderCardDesarrolladores;
