interface SurveillanceWidgetProps {
    count: number;
    label: string;
    backgroundColor: string;
    onClick?: () => void;
  }
  
  const SurveillanceWidget: React.FC<SurveillanceWidgetProps> = ({
    count,
    label,
    backgroundColor,
    onClick,
  }) => {
    return (
      <div
      className={`${backgroundColor} text-white rounded-lg p-6 text-center min-h-[70px] max-h-[80px] flex flex-col justify-center cursor-pointer transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-lg`}
      style={{ width: "100%" }}
      onClick={onClick}
      >
        <p className="text-2xl font-semibold">{count}</p>
        <p>{label}</p>
      </div>
    );
  };
  
  export default SurveillanceWidget;
  