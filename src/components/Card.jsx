function Card({ title, color, titlebarClass = "", titleClass = "", action, className = "", children }) {
    return (
        <section className={`win ${className}`} style={{ "--c": color }}>
            <div className={`titlebar ${titlebarClass}`} style={{ backgroundColor: color }}>
                <span className="dot-btn" />

                <h2 className={`min-w-0 flex-1 truncate text-center ${titleClass}`} title={title}>
                    {title}
                </h2>

                {action}
            </div>

            {children}
        </section>
    );
}

export default Card