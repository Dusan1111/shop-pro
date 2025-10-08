import "./submit-button.scss"; 

const SubmitButtonComponent = ({ content, submit }) => {
  return (
      <div className="submit_button_wrapper">
      <button className="submit_button" onClick={submit}>
        {content}
      </button>
    </div>
  );
};

export default SubmitButtonComponent;