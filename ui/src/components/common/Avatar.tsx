import { useNavigate } from 'react-router-dom';

import styles from './Avatar.module.css';

const DEFAULT_AVATAR = '/default_avatar.jpg';

interface AvatarProps {
    username: string;
    url?: string;
    width?: string
}

const Avatar = (props: AvatarProps) => {
    const navigate = useNavigate();

    const onImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = DEFAULT_AVATAR;
    };

    const onUserClick = () => {
        navigate(`/users/${encodeURIComponent(props.username)}`);
    };

    return (
        <img
            src={props.url || DEFAULT_AVATAR}
            alt={props.username}
            className={styles.avatar}
            style={{ width: props.width, height: props.width }}
            onError={onImageError}
            onClick={onUserClick}
        />
    );
}

export default Avatar;
