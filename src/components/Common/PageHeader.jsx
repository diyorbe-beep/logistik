import React from 'react';
import './PageHeader.scss';

/**
 * Reusable PageHeader component for consistent hero sections across all pages.
 * 
 * @param {string} badge - (Optional) Small badge text displayed above the title
 * @param {string} title - The main heading title
 * @param {string} description - (Optional) Subtitle or description text
 * @param {React.Node} actions - (Optional) Action buttons or search bars
 * @param {React.Node} visual - (Optional) Image or illustration displayed on the right
 * @param {boolean} centered - (Optional) If true, centers all content and hides visual side
 */
const PageHeader = ({
    badge,
    title,
    description,
    actions,
    visual,
    centered = false
}) => {
    return (
        <header className={`unified-page-header ${centered ? 'centered' : ''}`}>
            <div className="container">
                <div className="header-content">
                    {badge && <div className="header-badge fade-in">{badge}</div>}
                    <h1 className="header-title slide-up">{title}</h1>
                    {description && <p className="header-subtitle fade-in">{description}</p>}
                    {actions && <div className="header-actions fade-in">{actions}</div>}
                </div>
                {!centered && visual && (
                    <div className="header-visual fade-in">
                        {visual}
                    </div>
                )}
            </div>
        </header>
    );
};

export default PageHeader;
