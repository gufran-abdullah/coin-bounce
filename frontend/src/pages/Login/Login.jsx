import styles from './Login.module.css';
import TextInput from '../../components/TextInput/TextInput';
import loginSchema from '../../schemas/loginSchema';
import { useFormik } from 'formik';

function Login() {
    const {values, touched, handleBlur, handleChange, errors} = useFormik({
        initialValues: {
            username: '',
            password: ''
        },
        validationSchema: loginSchema
    });
    return (
        <div className={styles.loginWrapper}>
            <div className={styles.loginHeader}>Log into your account</div>
            <TextInput 
                type="text" 
                value={values.username} 
                name="username" 
                onBlur={handleBlur} 
                onChange={handleChange} 
                placeholder="username" 
                error={errors.username && touched.username ? 1 : undefined} 
                errorMessage={errors.username} 
            />
            <TextInput 
                type="password" 
                value={values.password} 
                name="password" 
                onBlur={handleBlur} 
                onChange={handleChange} 
                placeholder="password" 
                error={errors.password && touched.password ? 1 : undefined} 
                errorMessage={errors.password} 
            />
            <button className={styles.logInButton}>Log In</button>
            <span>Don't you have account? <button className={styles.createAccount}>Register</button></span>
        </div>
    );
}

export default Login;
