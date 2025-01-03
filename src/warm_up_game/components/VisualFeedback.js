import React, { useEffect } from 'react';
import './VisualFeedback.css';

const VisualFeedback = ({ barNumber, show, onComplete }) => {
    console.log('VisualFeedback rendered:', { barNumber, show }); // Add this log

    // Messages for each bar failure
    const quickMessages = {
        1: "OH NO!",
        2: "WHOOPS!",
        3: "OH DEAR!"
    };
    
    const messages = {
        1: "REMEMBER TO PRACTICE BEFORE YOU PERFORM!",
        2: "KEEP GOING. PRACTICE MAKES PERFECT!",
        3: "TRY THE NEXT BAR, MUSICIANS ALWAYS PRACTICE!"
    };
    // When shown, set timer to hide
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                const element = document.querySelector('.feedback-content');
                if (element) {
                    element.addEventListener('animationend', onComplete, { once: true });
                }
            }, 3000); // Keep timeout aligned with animation duration
            return () => clearTimeout(timer);
        }
    }, [show, onComplete]);

    if (!show) return null;


    return (
        <div className="feedback-popup">
            <div className="feedback-content">
    <div className="feedback-hearts">
        {[...Array(4)].map((_, index) => (
            <img 
                key={index}
                src="/assets/images/ui/heart-empty.svg"
                alt="Empty Heart"
                className="feedback-heart"
            />
        ))}
    </div>
    <p className="feedback-quick-message">
        {quickMessages[barNumber]}
    </p>
    <p className="feedback-message">
        {messages[barNumber]}
    </p>
</div>
        </div>
    );
};

export default VisualFeedback;