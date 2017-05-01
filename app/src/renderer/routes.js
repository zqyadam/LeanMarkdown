export default [
// {
//   path: '/',
//   name: 'login',
//   component: require('components/Login'),
//   meta: {
//     requiresAuth: false
//   }
// }, 
{
  path: '/editor',
  name: 'editor',
  component: require('components/Editor'),
  meta: {
    requiresAuth: true
  }
}, {
  path: '*',
  redirect: '/editor',
}]
