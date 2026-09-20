import PropTypes from "prop-types";


function Card({
  title,
  value,
  subtitle,
  icon,
  color,
}) {

  return (

    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">


      <div className="flex items-center justify-between">


        <div>


          <p className="text-sm text-slate-500">
            {title}
          </p>


          <h2 className="text-3xl font-bold text-slate-800 mt-2">
            {value}
          </h2>


          <p className="text-sm text-slate-400 mt-2">
            {subtitle}
          </p>


        </div>



        <div
          className={`${color} w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl`}
        >

          {icon}

        </div>


      </div>


    </div>

  );

}



Card.propTypes = {

  title: PropTypes.string.isRequired,

  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,

  subtitle: PropTypes.string.isRequired,

  icon: PropTypes.element.isRequired,

  color: PropTypes.string.isRequired,

};



export default Card;