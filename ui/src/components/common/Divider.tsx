import styles from './Divider.module.css';

interface DividerProps {
    spacing?: 'small' | 'medium' | 'large';
    thickness?: 'thin' | 'medium' | 'thick';
}

const Divider = ({ spacing = 'medium', thickness = 'thin' }: DividerProps) => {
    return (
        <div className={`${styles.divider} ${styles[spacing]} ${styles[thickness]}`} />
    );
};

export default Divider;
