import Button from "@/components/Button"
import Input from "@/components/Input"
import styles from "@/styles/common.module.css"

export default function Login() {
    return (
        <div className={styles.center}>
            <div className={`${styles.surface}  ${styles.container}`}>
                <h1>Login</h1>

                <Input  />
                <Button disabled={false} style="primary" width="full">
                    Login
                </Button>
            </div>
        </div>
    )
}