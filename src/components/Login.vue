<template>
    <div class="mdl-card mdl-shadow--6dp" id="login-pane">
        <div class="mdl-card__title mdl-color--primary mdl-color-text--white">
            <h2 class="mdl-card__title-text"> {{ $store.state.title }}</h2>
        </div>
        <div class="mdl-card__supporting-text">
            <p>First, sign up for an account from the <b>Text from any device</b> option in the navigation drawer of the phone app.</p>
            <form>
                <div class="mdl-textfield mdl-js-textfield">
                    <input class="mdl-textfield__input" type="email" id="username" autofocus/>
                    <label class="mdl-textfield__label" for="username">Email Address</label>
                </div>
                <div class="mdl-textfield mdl-js-textfield">
                    <input class="mdl-textfield__input" type="password" id="password" />
                    <label class="mdl-textfield__label" for="password">Password</label>
                </div>
            </form>
            <a href="forgot_password.html">Forgot your password?</a><br/>
            <a href="ios_support.html">Have an <i>iPhone</i>?</a>
        </div>
        <div class="mdl-card__actions mdl-card--border">
            <button class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" id="login">Log in</button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'login',

    mounted () {
        this.$store.dispatch("loading", false);
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
    @import "../assets/scss/_vars.scss";
    
    #login-pane {
        position: relative;
        width: 330px;
        height: 100%;
        margin: 5em auto;
    }

</style>
