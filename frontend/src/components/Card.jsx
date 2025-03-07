import PropTypes from "prop-types";

const Card = ({image,title,description}) => {
  return (
    <>
        <div className="h-88 w-64 bg-red-200 shadow-lg rounded-lg">
            <img className="w-full h-48 object-cover" src={image} />

            <div className="content flex flex-col gap-2 justify-center items-center p-2 text-center">
              <h1 className="text-2xl font-bold">{title}</h1>
              <p className="text-md">{description}</p>
            </div>
          </div>
    </>
  )
}

Card.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

export default Card