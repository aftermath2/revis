import { useNavigate } from 'react-router-dom';
import { nip19 } from 'nostr-tools';

import styles from './Avatar.module.css';

const DEFAULT_AVATAR = '/default_avatar.jpg';

interface AvatarProps {
    publicKey: string;
    url?: string;
    width?: string
}

const Avatar = (props: AvatarProps) => {
    const navigate = useNavigate();

    const onImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = DEFAULT_AVATAR;
    };

    const onUserClick = () => {
        let publicKey = props.publicKey;
        if (!props.publicKey.startsWith('nprofile')) {
            publicKey = nip19.nprofileEncode({pubkey: props.publicKey});
        }
        void navigate(`/users/${publicKey}`);
    };

    return (
        <img
            src={props.url || DEFAULT_AVATAR}
            alt={props.publicKey}
            className={styles.avatar}
            style={{ width: props.width, height: props.width }}
            onError={onImageError}
            onClick={onUserClick}
        />
    );
}

export default Avatar;
