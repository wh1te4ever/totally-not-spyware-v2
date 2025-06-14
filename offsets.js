const offsets_obj = {
    dlsym: undefined,

    __MergedGlobals_52: undefined,
    memPoolStart: undefined,
    memPoolEnd: undefined,
    jitWriteSeparateHeaps: undefined,
    longjmp: undefined,
    usleep: undefined,
    mach_vm_protect: undefined,
    mach_task_self_: undefined,

    __ZZ6dlopenE1p: undefined,
    dlopen_internal: undefined,
    __ZL25sNotifyMonitoringDyldMain: undefined,
    __ZN4dyldL24notifyMonitoringDyldMainEv: undefined,
    cookieAddr: undefined,

    stackloader: undefined,
    ldrx8: undefined,
    dispatch: undefined,
    movx4: undefined,
    regloader: undefined,

    resolve() {
        // iOS 12.5.7, iPhone 5s
        // Mozilla/5.0 (iPhone; CPU iPhone OS 12_5_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.2 Mobile/15E148 Safari/604.1
        if (navigator.userAgent.match(/iPhone OS 12_5_7/) && window.screen.width == 320 && window.screen.height == 568) {
            log("[i] offsets selected for iPhone 5s, iOS 12.5.7");
            this.dlsym = 0x4A08;

            this.__MergedGlobals_52 = 0x32559040;
            this.memPoolStart = 0xC8;
            this.memPoolEnd = 0xD0;
            this.jitWriteSeparateHeaps = 0x3255A438;
            this.longjmp = 0x16f8;
            this.usleep = 0x1810BA4;
            this.mach_vm_protect = 0x2156c;
            this.mach_task_self_ = 0x39AD1AAC;

            this.__ZZ6dlopenE1p = 0x39BFA9E8;
            this.dlopen_internal = 0xc918;
            this.__ZL25sNotifyMonitoringDyldMain = 0x37942080;
            this.__ZN4dyldL24notifyMonitoringDyldMainEv = 0x8a1c;
            this.cookieAddr = (0x8ECA0 + 0x38);

            this.stackloader = 0x9594;
            this.ldrx8 = 0x185AB8;
            this.dispatch = 0x100F54;
            this.movx4 = 0x861F08;
            this.regloader = 0x25D18;
        }
        else {
            // throw "Unknown platform: " + navigator.userAgent;
        }
    }
};

const offsets = new Proxy(offsets_obj, {
    get(target, property) {
        if (target[property] === undefined) {
            throw `Using undefined offset ${property}`;
        }
        return target[property];
    }
});
