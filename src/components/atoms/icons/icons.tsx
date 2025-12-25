import React from 'react'

export type IconProps = {
    name: 'variation' |
    'close' |
    'image'
    size?: number
    fill?: string
    className?: string
    style?: React.CSSProperties
}

export default function Icon({ name, size = 24, fill = 'currentColor', className, style }: IconProps) {

    switch (name) {

        case 'variation':
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={size}
                    height={size}
                    viewBox="0 0 386 386"
                    fill="none"
                    className={className}
                    style={style}
                >
                    <path
                        d="M56 154.427H330.014M56 230.542H330.014M101.823 299.122H284.499C309.721 299.122 330.168 278.675 330.168 253.453V131.669C330.168 106.447 309.721 86 284.499 86H101.823C76.6005 86 56.1538 106.447 56.1538 131.669V253.453C56.1538 278.675 76.6005 299.122 101.823 299.122Z"
                        stroke={fill}
                        strokeWidth="22.8345"
                    />
                </svg>
            )

        case 'image':
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill={fill}
                    className={className}
                    style={style}
                    width={size}
                    height={size}
                >
                    <path fillRule="evenodd" clipRule="evenodd" d="M7 20.75C4.37665 20.75 2.25 18.6234 2.25 16L2.25 8C2.25 5.37665 4.37665 3.25 7 3.25L17 3.25C19.6234 3.25 21.75 5.37665 21.75 8V16C21.75 18.6234 19.6234 20.75 17 20.75H7ZM3.75 16C3.75 17.7949 5.20507 19.25 7 19.25H17C18.7949 19.25 20.25 17.7949 20.25 16V8C20.25 6.20507 18.7949 4.75 17 4.75L7 4.75C5.20507 4.75 3.75 6.20507 3.75 8L3.75 16Z" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M11.2575 12.56C10.4063 11.6601 8.98781 11.6175 8.08412 12.4648L3.51296 16.7502C3.21077 17.0335 2.73615 17.0182 2.45285 16.716C2.16955 16.4138 2.18486 15.9392 2.48705 15.6559L7.05821 11.3704C8.56435 9.95844 10.9285 10.0294 12.3472 11.5292L19.0449 18.6095C19.3295 18.9105 19.3163 19.3851 19.0154 19.6698C18.7145 19.9544 18.2398 19.9413 17.9552 19.6403L11.2575 12.56Z" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M19.3612 13.947C18.9041 13.4898 18.1737 13.4566 17.677 13.8706L15.4802 15.7015C15.162 15.9667 14.6891 15.9238 14.4239 15.6056C14.1587 15.2874 14.2016 14.8145 14.5198 14.5493L16.7166 12.7183C17.8093 11.8076 19.4162 11.8805 20.422 12.8864L21.5304 13.995C21.8233 14.2879 21.8232 14.7628 21.5303 15.0557C21.2374 15.3485 20.7625 15.3485 20.4696 15.0556L19.3612 13.947Z" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M15.3125 7.87549C14.6221 7.87549 14.0625 8.43513 14.0625 9.12549C14.0625 9.81584 14.6221 10.3755 15.3125 10.3755C16.0029 10.3755 16.5625 9.81584 16.5625 9.12549C16.5625 8.43513 16.0029 7.87549 15.3125 7.87549ZM12.5625 9.12549C12.5625 7.60671 13.7937 6.37549 15.3125 6.37549C16.8313 6.37549 18.0625 7.60671 18.0625 9.12549C18.0625 10.6443 16.8313 11.8755 15.3125 11.8755C13.7937 11.8755 12.5625 10.6443 12.5625 9.12549Z" />
                </svg>
            )

        case 'close':
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={className}
                    style={style}
                    width={size}
                    height={size}
                    viewBox="0 0 24 24"
                >
                    <path d="M7.75684 7.75781L16.2421 16.2431M16.2421 7.75781L7.75684 16.2431" stroke={fill} strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            )

        default:
            return null
    }
}