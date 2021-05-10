Vue.component("resource-display", {
    props: ["layer"],
    methods: {
        formatNumber: (n, prec, prec1000, lim) => functions.formatNumber(n, prec, prec1000, lim)
    },
    template: `<p class="resource-display">You have <span>{{formatNumber(layer.resource, 3, 0, 1e15)}}</span> <resource-name :layerid="layer.layer"></resource-name></p>`
});
