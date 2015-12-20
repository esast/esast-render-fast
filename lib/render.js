(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/ast', 'esast/lib/ast', 'esast/lib/Loc', 'op/Op', 'source-map/dist/source-map.min'], factory);
    }
})(function (require, exports) {
    "use strict";

    var Ast = require('esast/lib/ast');
    var ast_1 = require('esast/lib/ast');
    var Loc_1 = require('esast/lib/Loc');
    var Op_1 = require('op/Op');
    var source_map_min_1 = require('source-map/dist/source-map.min');
    function render(ast) {
        let options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        setUp(options);
        e(ast);
        const res = strOut;
        tearDown();
        return res;
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = render;
    function renderWithSourceMap(ast, inFilePath, outFilePath) {
        let options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

        setUp(options);
        setUpSourceMaps(inFilePath, outFilePath);
        e(ast);
        const res = { code: strOut, sourceMap: sourceMap.toJSON() };
        tearDown();
        return res;
    }
    exports.renderWithSourceMap = renderWithSourceMap;
    let strOut, indentAmount, indentStr, usingSourceMaps, curAst, inFilePath, sourceMap, outLine, outColumn, lastMappedAst, ugly;
    function setUp(options) {
        ugly = Boolean(options.ugly);
        indentAmount = 0;
        _setIndent();
        strOut = '';
        usingSourceMaps = false;
    }
    function setUpSourceMaps(inPath, outPath) {
        usingSourceMaps = true;
        inFilePath = inPath;
        sourceMap = new source_map_min_1.SourceMapGenerator({ file: outPath });
        outLine = Loc_1.Pos.start.line;
        outColumn = Loc_1.Pos.start.column;
        lastMappedAst = null;
    }
    function tearDown() {
        strOut = inFilePath = sourceMap = curAst = lastMappedAst = null;
    }
    function e(ast) {
        if (usingSourceMaps) curAst = ast;
        ast[renderSymbol]();
    }
    function o(str) {
        strOut = strOut + str;
        if (usingSourceMaps) _mapStr(str);
    }
    function interleave(asts, str) {
        if (!isEmpty(asts)) {
            const maxI = asts.length - 1;
            for (let i = 0; i < maxI; i = i + 1) {
                e(asts[i]);
                o(str);
            }
            e(asts[maxI]);
        }
    }
    function paren(asts) {
        o('(');
        interleave(asts, ',');
        o(')');
    }
    function block(blockLines, lineSeparator) {
        if (isEmpty(blockLines)) o('{}');else {
            o('{');
            indent();
            nl();
            lines(blockLines, lineSeparator);
            unindent();
            nl();
            o('}');
        }
    }
    function lines(lines, lineSeparator) {
        if (lines.length > 0) {
            const maxI = lines.length - 1;
            for (let i = 0; i < maxI; i = i + 1) {
                e(lines[i]);
                o(lineSeparator);
                nl();
            }
            e(lines[maxI]);
        }
    }
    const indentStrs = [''];
    function _setIndent() {
        indentStr = indentStrs[indentAmount];
        while (indentStr === undefined) {
            indentStrs.push(`${ last(indentStrs) }\t`);
            indentStr = indentStrs[indentAmount];
        }
    }
    function indent() {
        if (!ugly) {
            indentAmount = indentAmount + 1;
            _setIndent();
        }
    }
    function unindent() {
        if (!ugly) {
            indentAmount = indentAmount - 1;
            _setIndent();
        }
    }
    function nl() {
        if (!ugly) {
            strOut = `${ strOut }\n${ indentStr }`;
            if (usingSourceMaps) _mapNewLine();
        }
    }
    function _mapStr(str) {
        if (curAst !== lastMappedAst) Op_1.opEach(curAst.loc, loc => {
            sourceMap.addMapping({
                source: inFilePath,
                original: loc.start,
                generated: new Loc_1.Pos(outLine, outColumn)
            });
            lastMappedAst = curAst;
        });
        outColumn = outColumn + str.length;
    }
    function _mapNewLine() {
        outLine = outLine + 1;
        outColumn = Loc_1.Pos.start.column + indentAmount;
        lastMappedAst = null;
    }
    function fun() {
        if (this.async) o('async ');
        o('function');
        if (this.generator) o('*');
        if (this.id !== null) {
            o(' ');
            e(this.id);
        }
        paren(this.params);
        e(this.body);
    }
    function arr() {
        if (isEmpty(this.elements)) o('[]');else {
            o('[');
            interleave(this.elements, ',');
            o(']');
        }
    }
    function rClass() {
        o('class ');
        if (this.id !== null) e(this.id);
        if (this.superClass !== null) {
            o(' extends ');
            e(this.superClass);
        }
        e(this.body);
    }
    function forInOf(_, kind) {
        o('for(');
        e(_.left);
        o(kind);
        e(_.right);
        o(')');
        e(_.body);
    }
    function implementMany(holder, method, nameToImpl) {
        Object.keys(nameToImpl).forEach(name => {
            holder[name].prototype[method] = nameToImpl[name];
        });
    }
    function isEmpty(arr) {
        return arr.length === 0;
    }
    function last(arr) {
        return arr[arr.length - 1];
    }
    const renderSymbol = Symbol('render');
    implementMany(Ast, renderSymbol, {
        Program() {
            lines(this.body, ';');
        },
        Identifier() {
            o(this.name);
        },
        EmptyStatement() {},
        BlockStatement() {
            block(this.body, ';');
        },
        ExpressionStatement() {
            e(this.expression);
        },
        IfStatement() {
            o('if(');
            e(this.test);
            o(')');
            e(this.consequent);
            if (this.alternate !== null) {
                if (!(this.consequent instanceof ast_1.BlockStatement)) o(';');
                o(' else ');
                e(this.alternate);
            }
        },
        LabeledStatement() {
            e(this.label);
            o(':');
            e(this.body);
        },
        BreakStatement() {
            o('break');
            if (this.label !== null) {
                o(' ');
                e(this.label);
            }
        },
        ContinueStatement() {
            o('continue');
            if (this.label !== null) {
                o(' ');
                e(this.label);
            }
        },
        SwitchCase() {
            if (this.test === null) o('default');else {
                o('case ');
                e(this.test);
            }
            o(':');
            switch (this.consequent.length) {
                case 0:
                    break;
                case 1:
                    e(this.consequent[0]);
                    break;
                default:
                    indent();
                    nl();
                    lines(this.consequent, ';');
                    unindent();
            }
        },
        SwitchStatement() {
            o('switch(');
            e(this.discriminant);
            o(')');
            block(this.cases, '');
        },
        ReturnStatement() {
            if (this.argument === null) o('return');else {
                o('return ');
                e(this.argument);
            }
        },
        ThrowStatement() {
            o('throw ');
            e(this.argument);
        },
        CatchClause() {
            o('catch(');
            e(this.param);
            o(')');
            e(this.body);
        },
        TryStatement() {
            o('try ');
            e(this.block);
            if (this.handler !== null) e(this.handler);
            if (this.finalizer !== null) {
                o('finally');
                e(this.finalizer);
            }
        },
        WhileStatement() {
            o('while(');
            e(this.test);
            o(')');
            e(this.body);
        },
        DoWhileStatement() {
            o('do ');
            e(this.body);
            if (!(this.body instanceof ast_1.BlockStatement)) o(';');
            o(' while(');
            e(this.test);
            o(')');
        },
        ForStatement() {
            o('for(');
            if (this.init !== null) e(this.init);
            o(';');
            if (this.test !== null) e(this.test);
            o(';');
            if (this.update !== null) e(this.update);
            o(')');
            e(this.body);
        },
        ForInStatement() {
            forInOf(this, ' in ');
        },
        ForOfStatement() {
            forInOf(this, ' of ');
        },
        DebuggerStatement() {
            o('debugger');
        },
        FunctionDeclaration: fun,
        VariableDeclarator() {
            e(this.id);
            if (this.init !== null) {
                o('=');
                e(this.init);
            }
        },
        VariableDeclaration() {
            o(this.kind);
            o(' ');
            interleave(this.declarations, ',');
        },
        ThisExpression() {
            o('this');
        },
        ArrayExpression: arr,
        ObjectExpression() {
            if (isEmpty(this.properties)) o('{}');else block(this.properties, ',');
        },
        PropertyPlain() {
            outputPropertyKey(this);
            o(':');
            e(this.value);
        },
        PropertyMethod() {
            if (this.value.async) o('async ');
            if (this.value.generator) o('*');
            outputPropertyFunction(this, this.value);
        },
        PropertyGet() {
            o('get ');
            outputPropertyFunction(this, this.value);
        },
        PropertySet() {
            o('set ');
            outputPropertyFunction(this, this.value);
        },
        FunctionExpression: fun,
        ArrowFunctionExpression() {
            if (this.params.length === 1 && this.params[0] instanceof ast_1.Identifier) e(this.params[0]);else paren(this.params);
            o('=>');
            e(this.body);
        },
        SequenceExpression() {
            interleave(this.expressions, ',');
        },
        UnaryExpression() {
            o(this.operator);
            o(' ');
            e(this.argument);
        },
        BinaryExpression() {
            o('(');
            e(this.left);
            o(this.operator === 'instanceof' ? ' instanceof ' : this.operator);
            e(this.right);
            o(')');
        },
        AssignmentExpression() {
            e(this.left);
            o(this.operator);
            e(this.right);
        },
        UpdateExpression() {
            if (this.prefix) {
                o(this.operator);
                e(this.argument);
            } else {
                e(this.argument);
                o(this.operator);
            }
        },
        LogicalExpression() {
            o('(');
            e(this.left);
            o(this.operator);
            e(this.right);
            o(')');
        },
        ConditionalExpression() {
            o('(');
            e(this.test);
            o('?');
            e(this.consequent);
            o(':');
            e(this.alternate);
            o(')');
        },
        NewExpression() {
            o('new (');
            e(this.callee);
            o(')');
            paren(this.arguments);
        },
        Super() {
            o('super');
        },
        CallExpression() {
            if (this.callee instanceof ast_1.ArrowFunctionExpression) {
                o('(');
                e(this.callee);
                o(')');
            } else e(this.callee);
            paren(this.arguments);
        },
        SpreadElement() {
            o('...');
            e(this.argument);
        },
        MemberExpressionPlain() {
            e(this.object);
            if (this.object instanceof ast_1.Literal && typeof this.object.value === 'number' && this.object.value === (this.object.value | 0)) o('..');else o('.');
            e(this.property);
        },
        MemberExpressionComputed() {
            e(this.object);
            o('[');
            e(this.property);
            o(']');
        },
        YieldExpression() {
            if (this.argument === null) o('(yield)');else {
                o(this.delegate ? '(yield* ' : '(yield ');
                if (this.argument !== null) e(this.argument);
                o(')');
            }
        },
        Literal() {
            o(this.value.toString());
        },
        LiteralNull() {
            o('null');
        },
        LiteralString() {
            o('"');
            o(escapeStringForLiteral(this.value));
            o('"');
        },
        TemplateElement() {
            o(this.value.raw);
        },
        TemplateLiteral() {
            o('`');
            e(this.quasis[0]);
            for (let i = 0; i < this.expressions.length; i = i + 1) {
                o('${');
                e(this.expressions[i]);
                o('}');
                e(this.quasis[i + 1]);
            }
            o('`');
        },
        TaggedTemplateExpression() {
            e(this.tag);
            e(this.quasi);
        },
        AssignmentProperty() {
            e(this.key);
            if (this.key !== this.value) {
                o(':');
                e(this.value);
            }
        },
        ObjectPattern() {
            o('{');
            interleave(this.properties, ',');
            o('}');
        },
        ArrayPattern: arr,
        RestElement() {
            o('...');
            e(this.argument);
        },
        MethodDefinitionPlain() {
            if (this.static) o('static ');
            if (this.value.async) o('async ');
            if (this.value.generator) o('*');
            if (this.kind !== 'method') {
                o(this.kind);
                o(' ');
            }
            if (this.computed) {
                o('[');
                e(this.key);
                o(']');
            } else e(this.key);
            paren(this.value.params);
            e(this.value.body);
        },
        MethodDefinitionConstructor() {
            o('constructor');
            paren(this.value.params);
            e(this.value.body);
        },
        ClassBody() {
            block(this.body, '');
        },
        ClassDeclaration: rClass,
        ClassExpression: rClass,
        MetaProperty() {
            e(this.meta);
            o('.');
            e(this.property);
        },
        ImportDeclaration() {
            o('import ');
            let def, namespace;
            const specifiers = [];
            for (const s of this.specifiers) if (s instanceof ast_1.ImportDefaultSpecifier) {
                if (def === undefined) def = s;else throw new Error('Multiple default imports');
            } else if (s instanceof ast_1.ImportNamespaceSpecifier) {
                if (namespace === undefined) namespace = s;else throw new Error('Multiple namespace imports');
            } else specifiers.push(s);
            let needComma = false;
            if (def !== undefined) {
                e(def);
                needComma = true;
            }
            if (namespace !== undefined) {
                if (needComma) o(',');
                e(namespace);
                needComma = true;
            }
            if (!isEmpty(specifiers)) {
                if (needComma) o(',');
                o('{');
                interleave(specifiers, ',');
                o('}');
            }
            o(' from ');
            e(this.source);
        },
        ImportSpecifier() {
            if (this.imported === this.local) e(this.local);else {
                e(this.imported);
                o(' as ');
                e(this.local);
            }
        },
        ImportDefaultSpecifier() {
            e(this.local);
        },
        ImportNamespaceSpecifier() {
            o('* as ');
            e(this.local);
        },
        ExportSpecifier() {
            e(this.local);
            if (this.exported !== this.local) {
                o(' as ');
                e(this.exported);
            }
        },
        ExportNamedDeclaration() {
            o('export ');
            if (this.declaration === null) {
                o('{');
                interleave(this.specifiers, ',');
                o('}');
                if (this.source !== null) {
                    o(' from ');
                    e(this.source);
                }
            } else e(this.declaration);
        },
        ExportDefaultDeclaration() {
            o('export default ');
            e(this.declaration);
        },
        ExportAllDeclaration() {
            o('export * from ');
            e(this.source);
        }
    });
    function outputPropertyKey(_) {
        if (_.computed) {
            o('[');
            e(_.key);
            o(']');
        } else e(_.key);
    }
    function outputPropertyFunction(_, value) {
        outputPropertyKey(_);
        paren(value.params);
        e(value.body);
    }
    function escapeStringForLiteral(str) {
        return str.replace(/[\\"\n\t\b\f\v\r\u2028\u2029]/g, ch => literalEscapes.get(ch));
    }
    const literalEscapes = new Map([['\\', '\\\\'], ['"', '\\"'], ['\n', '\\n'], ['\t', '\\t'], ['\b', '\\b'], ['\f', '\\f'], ['\v', '\\v'], ['\r', '\\r'], ['\u2028', '\\u2028'], ['\u2029', '\\u2029']]);
});
//# sourceMappingURL=render.js.map
