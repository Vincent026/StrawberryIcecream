
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.2' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\Box.svelte generated by Svelte v3.44.2 */

    const file$1 = "src\\Box.svelte";

    // (2:7)     
    function fallback_block(ctx) {
    	let em;

    	const block = {
    		c: function create() {
    			em = element("em");
    			em.textContent = "no content was provided";
    			add_location(em, file$1, 2, 2, 30);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, em, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(em);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(2:7)     ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);
    	const default_slot_or_fallback = default_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			attr_dev(div, "class", "box svelte-1k17yxl");
    			add_location(div, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Box', slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Box> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Box extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Box",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.44.2 */
    const file = "src\\App.svelte";

    // (7:1) <Box>
    function create_default_slot_5(ctx) {
    	let h2;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "curriculum vitae";
    			t1 = space();
    			p = element("p");
    			p.textContent = "laatste bijwerking: 9 december 2021 xx";
    			add_location(h2, file, 7, 2, 94);
    			add_location(p, file, 8, 2, 123);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(7:1) <Box>",
    		ctx
    	});

    	return block;
    }

    // (11:1) <Box>
    function create_default_slot_4(ctx) {
    	let h4;
    	let t1;
    	let p0;
    	let t3;
    	let p1;

    	const block = {
    		c: function create() {
    			h4 = element("h4");
    			h4.textContent = "Domeinen";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "1. Plannings- en beheersoftware voor uitzenddiensten van personenwagenvervoer en locatiewerk.";
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "2. hedgingsoftware voor grondstoffenhandel. (tot 2019)";
    			add_location(h4, file, 11, 2, 189);
    			add_location(p0, file, 12, 2, 210);
    			add_location(p1, file, 13, 2, 314);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(11:1) <Box>",
    		ctx
    	});

    	return block;
    }

    // (16:1) <Box>
    function create_default_slot_3(ctx) {
    	let h4;
    	let t1;
    	let p0;
    	let t3;
    	let p1;
    	let t5;
    	let p2;

    	const block = {
    		c: function create() {
    			h4 = element("h4");
    			h4.textContent = "Projecten 2021";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Docker";
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "Svelte";
    			t5 = space();
    			p2 = element("p");
    			p2.textContent = "Swagger";
    			add_location(h4, file, 16, 2, 396);
    			add_location(p0, file, 17, 2, 423);
    			add_location(p1, file, 18, 2, 440);
    			add_location(p2, file, 19, 2, 457);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, p2, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(p2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(16:1) <Box>",
    		ctx
    	});

    	return block;
    }

    // (22:1) <Box>
    function create_default_slot_2(ctx) {
    	let h4;
    	let t1;
    	let p0;
    	let t3;
    	let p1;
    	let t5;
    	let p2;

    	const block = {
    		c: function create() {
    			h4 = element("h4");
    			h4.textContent = "Projecten 2020";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "proof of concept maken voor API: REST, GraphQL, gRPC";
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "proof of concept maken voor frontend in .NET Core: Razor Pages, MVC, Blazor";
    			t5 = space();
    			p2 = element("p");
    			p2.textContent = "ontsluiten legacy .net 4.6 code in een gRPC- en GraphQL-service";
    			add_location(h4, file, 22, 2, 492);
    			add_location(p0, file, 23, 2, 519);
    			add_location(p1, file, 24, 2, 582);
    			add_location(p2, file, 25, 2, 668);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, p2, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(p2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(22:1) <Box>",
    		ctx
    	});

    	return block;
    }

    // (28:1) <Box>
    function create_default_slot_1(ctx) {
    	let h40;
    	let t1;
    	let p0;
    	let t3;
    	let p1;
    	let t5;
    	let p2;
    	let t7;
    	let p3;
    	let t9;
    	let p4;
    	let t11;
    	let p5;
    	let t13;
    	let p6;
    	let t15;
    	let p7;
    	let t17;
    	let p8;
    	let t19;
    	let p9;
    	let t21;
    	let h3;
    	let t23;
    	let p10;
    	let t25;
    	let p11;
    	let t27;
    	let p12;
    	let t29;
    	let h41;
    	let t31;
    	let h42;
    	let t33;
    	let p13;
    	let t35;
    	let p14;
    	let t37;
    	let p15;
    	let t39;
    	let p16;
    	let t41;
    	let p17;
    	let t43;
    	let p18;
    	let t45;
    	let h43;
    	let t47;
    	let p19;
    	let t49;
    	let p20;
    	let t51;
    	let p21;
    	let t53;
    	let p22;
    	let t55;
    	let p23;
    	let t57;
    	let p24;
    	let t59;
    	let p25;
    	let t61;
    	let p26;
    	let t63;
    	let p27;
    	let t65;
    	let p28;
    	let t67;
    	let p29;
    	let t69;
    	let p30;

    	const block = {
    		c: function create() {
    			h40 = element("h4");
    			h40.textContent = "Projecten 2016 - 2019";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "- opzetten CI/CD pipeline voor verschillende applicatietypes in TFS";
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "- workItem-synchronisatie tussen TFS en monday.com";
    			t5 = space();
    			p2 = element("p");
    			p2.textContent = "- integratie tussen MoreApp-formulieren en backendsysteem";
    			t7 = space();
    			p3 = element("p");
    			p3.textContent = "- integratie tussen AFAS en backendsysteem";
    			t9 = space();
    			p4 = element("p");
    			p4.textContent = "- migratie van legacy database/software naar Entity Framework en hogere .net versie";
    			t11 = space();
    			p5 = element("p");
    			p5.textContent = "- verplaatsen rekeninstensieve query naar SQL Azure en tabel vullen met bulkinsert";
    			t13 = space();
    			p6 = element("p");
    			p6.textContent = "- Single Sign On (SSO) voor drie websites realiseren met eigen autorisatieserver";
    			t15 = space();
    			p7 = element("p");
    			p7.textContent = "- integratie van een 3d party (Python-)planningsalgoritme met backendsysteem";
    			t17 = space();
    			p8 = element("p");
    			p8.textContent = "- ontwerpen en bouwen van een algoritme voor planning van locatiewerk";
    			t19 = space();
    			p9 = element("p");
    			p9.textContent = "- toevoegen en refactoren van diverse functionaliteit aan bestaande software";
    			t21 = space();
    			h3 = element("h3");
    			h3.textContent = "Analyse en ontwerp";
    			t23 = space();
    			p10 = element("p");
    			p10.textContent = "- aandacht voor onderhoudbaarheid, testbaarheid, beveiliging, stabiliteit, performance, duidelijk ontwerp / design patterns, logging en documentatie.";
    			t25 = space();
    			p11 = element("p");
    			p11.textContent = "opstellen van specificaties en urenbegroting";
    			t27 = space();
    			p12 = element("p");
    			p12.textContent = "Test Driven uitwerking van gedetailleerde specs";
    			t29 = space();
    			h41 = element("h4");
    			h41.textContent = "GUI ontwerp";
    			t31 = space();
    			h42 = element("h4");
    			h42.textContent = "DevOps en projectplanning";
    			t33 = space();
    			p13 = element("p");
    			p13.textContent = "Build- en Release-omgeving inrichten onderhouden in TFS 2015/’18";
    			t35 = space();
    			p14 = element("p");
    			p14.textContent = "REST-API en client libraries TFS, PowerShell, Branching & Merging in TFVC, FTP.";
    			t37 = space();
    			p15 = element("p");
    			p15.textContent = "optimaliseren in TFS van het configuratiebeheer van de applicaties";
    			t39 = space();
    			p16 = element("p");
    			p16.textContent = "installatie(scripts) van webapplicaties in IIS / installeren SSL certificaten";
    			t41 = space();
    			p17 = element("p");
    			p17.textContent = "° Windows Server 2008/12/16 (basis DevOps gebruik)";
    			t43 = space();
    			p18 = element("p");
    			p18.textContent = "° sprintplanning in TFS";
    			t45 = space();
    			h43 = element("h4");
    			h43.textContent = "Ontwikkeling";
    			t47 = space();
    			p19 = element("p");
    			p19.textContent = "• Uitbouwen en onderhouden desktop-apps, websites / webservices en Windows Services";
    			t49 = space();
    			p20 = element("p");
    			p20.textContent = "• unittesten en CodedUI-testen";
    			t51 = space();
    			p21 = element("p");
    			p21.textContent = "• ASP.NET WebForms + MVC / WebAPI / OWIN / javascript (summier)";
    			t53 = space();
    			p22 = element("p");
    			p22.textContent = "• SSO met IdentityServer3. Later gemigreerd naar IdentityServer4 / ASP.NET Core / Dapper.";
    			t55 = space();
    			p23 = element("p");
    			p23.textContent = "• Windows Services / FireDaemon om Python scripts te hosten, alsmede enig onderhoud aan Python code zelf";
    			t57 = space();
    			p24 = element("p");
    			p24.textContent = "• WinForms  (VB.NET en C#)";
    			t59 = space();
    			p25 = element("p");
    			p25.textContent = "• SQL Server 2012/16 / Entity Framework / LINQ";
    			t61 = space();
    			p26 = element("p");
    			p26.textContent = "• Google Docs API";
    			t63 = space();
    			p27 = element("p");
    			p27.textContent = "• SpreadheetLight";
    			t65 = space();
    			p28 = element("p");
    			p28.textContent = "• Azure (SQL / Storage)";
    			t67 = space();
    			p29 = element("p");
    			p29.textContent = "• Unity + Simple Injector / SeriLog";
    			t69 = space();
    			p30 = element("p");
    			p30.textContent = "• diversen, o.a. RegEx, xpath, xml/json parsing";
    			add_location(h40, file, 28, 2, 759);
    			add_location(p0, file, 29, 2, 793);
    			add_location(p1, file, 30, 2, 871);
    			add_location(p2, file, 31, 2, 932);
    			add_location(p3, file, 32, 2, 1000);
    			add_location(p4, file, 33, 2, 1053);
    			add_location(p5, file, 34, 2, 1147);
    			add_location(p6, file, 35, 2, 1240);
    			add_location(p7, file, 36, 2, 1331);
    			add_location(p8, file, 37, 2, 1418);
    			add_location(p9, file, 38, 2, 1498);
    			add_location(h3, file, 39, 2, 1585);
    			add_location(p10, file, 40, 2, 1616);
    			add_location(p11, file, 41, 2, 1776);
    			add_location(p12, file, 42, 2, 1831);
    			add_location(h41, file, 43, 2, 1889);
    			add_location(h42, file, 44, 2, 1913);
    			add_location(p13, file, 45, 2, 1951);
    			add_location(p14, file, 46, 2, 2026);
    			add_location(p15, file, 47, 2, 2116);
    			add_location(p16, file, 48, 2, 2193);
    			add_location(p17, file, 49, 2, 2281);
    			add_location(p18, file, 50, 2, 2342);
    			add_location(h43, file, 51, 2, 2376);
    			add_location(p19, file, 52, 2, 2401);
    			add_location(p20, file, 53, 2, 2495);
    			add_location(p21, file, 54, 2, 2536);
    			add_location(p22, file, 55, 2, 2610);
    			add_location(p23, file, 56, 2, 2710);
    			add_location(p24, file, 57, 2, 2825);
    			add_location(p25, file, 58, 2, 2862);
    			add_location(p26, file, 59, 2, 2919);
    			add_location(p27, file, 60, 2, 2947);
    			add_location(p28, file, 61, 2, 2975);
    			add_location(p29, file, 62, 2, 3009);
    			add_location(p30, file, 63, 2, 3055);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h40, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, p2, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, p3, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, p4, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, p5, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, p6, anchor);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, p7, anchor);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, p8, anchor);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, p9, anchor);
    			insert_dev(target, t21, anchor);
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, p10, anchor);
    			insert_dev(target, t25, anchor);
    			insert_dev(target, p11, anchor);
    			insert_dev(target, t27, anchor);
    			insert_dev(target, p12, anchor);
    			insert_dev(target, t29, anchor);
    			insert_dev(target, h41, anchor);
    			insert_dev(target, t31, anchor);
    			insert_dev(target, h42, anchor);
    			insert_dev(target, t33, anchor);
    			insert_dev(target, p13, anchor);
    			insert_dev(target, t35, anchor);
    			insert_dev(target, p14, anchor);
    			insert_dev(target, t37, anchor);
    			insert_dev(target, p15, anchor);
    			insert_dev(target, t39, anchor);
    			insert_dev(target, p16, anchor);
    			insert_dev(target, t41, anchor);
    			insert_dev(target, p17, anchor);
    			insert_dev(target, t43, anchor);
    			insert_dev(target, p18, anchor);
    			insert_dev(target, t45, anchor);
    			insert_dev(target, h43, anchor);
    			insert_dev(target, t47, anchor);
    			insert_dev(target, p19, anchor);
    			insert_dev(target, t49, anchor);
    			insert_dev(target, p20, anchor);
    			insert_dev(target, t51, anchor);
    			insert_dev(target, p21, anchor);
    			insert_dev(target, t53, anchor);
    			insert_dev(target, p22, anchor);
    			insert_dev(target, t55, anchor);
    			insert_dev(target, p23, anchor);
    			insert_dev(target, t57, anchor);
    			insert_dev(target, p24, anchor);
    			insert_dev(target, t59, anchor);
    			insert_dev(target, p25, anchor);
    			insert_dev(target, t61, anchor);
    			insert_dev(target, p26, anchor);
    			insert_dev(target, t63, anchor);
    			insert_dev(target, p27, anchor);
    			insert_dev(target, t65, anchor);
    			insert_dev(target, p28, anchor);
    			insert_dev(target, t67, anchor);
    			insert_dev(target, p29, anchor);
    			insert_dev(target, t69, anchor);
    			insert_dev(target, p30, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h40);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(p4);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(p5);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(p6);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(p7);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(p8);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(p9);
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(p10);
    			if (detaching) detach_dev(t25);
    			if (detaching) detach_dev(p11);
    			if (detaching) detach_dev(t27);
    			if (detaching) detach_dev(p12);
    			if (detaching) detach_dev(t29);
    			if (detaching) detach_dev(h41);
    			if (detaching) detach_dev(t31);
    			if (detaching) detach_dev(h42);
    			if (detaching) detach_dev(t33);
    			if (detaching) detach_dev(p13);
    			if (detaching) detach_dev(t35);
    			if (detaching) detach_dev(p14);
    			if (detaching) detach_dev(t37);
    			if (detaching) detach_dev(p15);
    			if (detaching) detach_dev(t39);
    			if (detaching) detach_dev(p16);
    			if (detaching) detach_dev(t41);
    			if (detaching) detach_dev(p17);
    			if (detaching) detach_dev(t43);
    			if (detaching) detach_dev(p18);
    			if (detaching) detach_dev(t45);
    			if (detaching) detach_dev(h43);
    			if (detaching) detach_dev(t47);
    			if (detaching) detach_dev(p19);
    			if (detaching) detach_dev(t49);
    			if (detaching) detach_dev(p20);
    			if (detaching) detach_dev(t51);
    			if (detaching) detach_dev(p21);
    			if (detaching) detach_dev(t53);
    			if (detaching) detach_dev(p22);
    			if (detaching) detach_dev(t55);
    			if (detaching) detach_dev(p23);
    			if (detaching) detach_dev(t57);
    			if (detaching) detach_dev(p24);
    			if (detaching) detach_dev(t59);
    			if (detaching) detach_dev(p25);
    			if (detaching) detach_dev(t61);
    			if (detaching) detach_dev(p26);
    			if (detaching) detach_dev(t63);
    			if (detaching) detach_dev(p27);
    			if (detaching) detach_dev(t65);
    			if (detaching) detach_dev(p28);
    			if (detaching) detach_dev(t67);
    			if (detaching) detach_dev(p29);
    			if (detaching) detach_dev(t69);
    			if (detaching) detach_dev(p30);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(28:1) <Box>",
    		ctx
    	});

    	return block;
    }

    // (66:1) <Box>
    function create_default_slot(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "hier komen de projecten van 1994 - 2016";
    			add_location(p, file, 66, 2, 3130);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(66:1) <Box>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let box0;
    	let t0;
    	let box1;
    	let t1;
    	let box2;
    	let t2;
    	let box3;
    	let t3;
    	let box4;
    	let t4;
    	let box5;
    	let t5;
    	let p;
    	let t6;
    	let a;
    	let t8;
    	let current;

    	box0 = new Box({
    			props: {
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	box1 = new Box({
    			props: {
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	box2 = new Box({
    			props: {
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	box3 = new Box({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	box4 = new Box({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	box5 = new Box({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(box0.$$.fragment);
    			t0 = space();
    			create_component(box1.$$.fragment);
    			t1 = space();
    			create_component(box2.$$.fragment);
    			t2 = space();
    			create_component(box3.$$.fragment);
    			t3 = space();
    			create_component(box4.$$.fragment);
    			t4 = space();
    			create_component(box5.$$.fragment);
    			t5 = space();
    			p = element("p");
    			t6 = text("Visit the ");
    			a = element("a");
    			a.textContent = "Svelte tutorial";
    			t8 = text(" to learn how to build Svelte apps.");
    			attr_dev(a, "href", "https://svelte.dev/tutorial");
    			add_location(a, file, 71, 12, 3209);
    			add_location(p, file, 70, 1, 3192);
    			attr_dev(main, "class", "svelte-175ol03");
    			add_location(main, file, 5, 0, 76);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(box0, main, null);
    			append_dev(main, t0);
    			mount_component(box1, main, null);
    			append_dev(main, t1);
    			mount_component(box2, main, null);
    			append_dev(main, t2);
    			mount_component(box3, main, null);
    			append_dev(main, t3);
    			mount_component(box4, main, null);
    			append_dev(main, t4);
    			mount_component(box5, main, null);
    			append_dev(main, t5);
    			append_dev(main, p);
    			append_dev(p, t6);
    			append_dev(p, a);
    			append_dev(p, t8);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const box0_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				box0_changes.$$scope = { dirty, ctx };
    			}

    			box0.$set(box0_changes);
    			const box1_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				box1_changes.$$scope = { dirty, ctx };
    			}

    			box1.$set(box1_changes);
    			const box2_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				box2_changes.$$scope = { dirty, ctx };
    			}

    			box2.$set(box2_changes);
    			const box3_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				box3_changes.$$scope = { dirty, ctx };
    			}

    			box3.$set(box3_changes);
    			const box4_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				box4_changes.$$scope = { dirty, ctx };
    			}

    			box4.$set(box4_changes);
    			const box5_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				box5_changes.$$scope = { dirty, ctx };
    			}

    			box5.$set(box5_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(box0.$$.fragment, local);
    			transition_in(box1.$$.fragment, local);
    			transition_in(box2.$$.fragment, local);
    			transition_in(box3.$$.fragment, local);
    			transition_in(box4.$$.fragment, local);
    			transition_in(box5.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(box0.$$.fragment, local);
    			transition_out(box1.$$.fragment, local);
    			transition_out(box2.$$.fragment, local);
    			transition_out(box3.$$.fragment, local);
    			transition_out(box4.$$.fragment, local);
    			transition_out(box5.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(box0);
    			destroy_component(box1);
    			destroy_component(box2);
    			destroy_component(box3);
    			destroy_component(box4);
    			destroy_component(box5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let { name } = $$props;
    	const writable_props = ['name'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({ Box, name });

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { name: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !('name' in props)) {
    			console.warn("<App> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
