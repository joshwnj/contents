var gc = $.gajus.contents;

describe('gc', function () {
    beforeEach(function () {
        $('body').html($.parseHTML(__html__['test/fixture/page.html']));
    });

    describe('.getHeadings()', function () {
        it('must throw an error if target does not exist', function () {
            expect(function () {
                gc.getHeadings($('#does-not-exist'))
            }).toThrowError('Target element does not exist.');
        });

        it('must throw an error if target does contain heading elements.', function () {
            expect(function () {
                gc.getHeadings($('#get-headings-no-heading-elements'))
            }).toThrowError('Target element does not contain heading elements.');
        });

        it('must read all headings from the target area', function () {
            var headings = gc.getHeadings($('#get-headings'));
            
            expect(headings.length).toEqual(6);
        });
    });

    describe('.deriveId()', function () {
        it('must throw an error if target does not exist or refers to more than one element', function () {
            expect(function () {
                gc.deriveId($('#derive-id h3'));
            }).toThrowError('Must reference a single element.');
        });

        it('must throw an error if target element does not have text', function () {
            expect(function () {
                gc.deriveId($('#derive-id h2'));
            }).toThrowError('Must have text.');
        });

        it('must throw an error if target element already has an ID', function () {
            expect(function () {
                gc.deriveId($('#derive-id #not-unique'));
            }).toThrowError('Already has an ID.');
        });

        it('must return the given ID', function () {
            expect(gc.deriveId($('#derive-id h1'))).toEqual('derive-id-foo');
        });

        it('must derive a unique id', function () {
            expect(gc.deriveId($('#derive-id h3:not([id])'))).toEqual('not-unique-2');
        });

        it('must use custom slug filter when provided', function () {
            var slugFilter = function () { return 'custom-filter'; };

            expect(gc.deriveId($('#derive-id h1'), slugFilter)).toEqual('custom-filter');
        });
    });

    describe('.giveId()', function () {
        it('must give ID to all elements that do not have it already', function () {
            var ids = [];

            gc.giveId(gc.getHeadings($('#give-id')));

            $('#give-id').children().each(function () {
                ids.push($(this).attr('id'));
            });

            expect(ids).toEqual(['give-id-foo-special', 'give-id-bar', 'give-id-baz']);
        });
    });

    describe('.generateHeadingHierarchyList()', function () {
        it('must represent a flat structure', function () {
            var headings = gc.getHeadings($('#generate-heading-hierarchy-list-flat')),
                list = gc.generateHeadingHierarchyList(headings, function () {});

            expect(list.prop('outerHTML')).toEqual('<ul><li></li><li></li><li></li></ul>');
        });

        it('must represent a multidimensional heading hierarchy', function () {
            var headings = gc.getHeadings($('#generate-heading-hierarchy-list-multidimensional')),
                list = gc.generateHeadingHierarchyList(headings, function () {});

            expect(list.prop('outerHTML')).toEqual('<ul><li><ul><li><ul><li></li><li></li></ul></li><li><ul><li><ul><li></li></ul></li><li></li></ul></li></ul></li></ul>');
        });

        it('must provide callback to evaluate each list item', function () {
            var headings = gc.getHeadings($('#generate-heading-hierarchy-list-flat')),
                i = 0,
                list = gc.generateHeadingHierarchyList(headings, function (li) {
                    li.text(i++);
                });

            expect(list.prop('outerHTML')).toEqual('<ul><li>0</li><li>1</li><li>2</li></ul>');
        });

        describe('default item interpreter', function () {
            it('must represent each item using a hyperlink', function () {
                var headings = gc.getHeadings($('#generate-heading-hierarchy-list-flat')),
                    list;

                headings.attr('id', 'foo');
                
                list = gc.generateHeadingHierarchyList(headings);

                expect(list.prop('outerHTML')).toEqual('<ul><li><a href="#foo">generate heading hierarchy list flat foo</a></li><li><a href="#foo">generate heading hierarchy list flat bar</a></li><li><a href="#foo">generate heading hierarchy list flat tar</a></li></ul>');
            });
        });
    });

    describe('.toSlug()', function () {
        it('must covert to lowercase', function () {
            expect(gc.toSlug('FOO')).toEqual('foo');
        });

        it('must replace characters with diacritics to their ASCII counterparts', function () {
            expect(gc.toSlug('ãàáäâẽèéëêìíïîõòóöôùúüûñç')).toEqual('aaaaaeeeeeiiiiooooouuuunc');
        });

        it('must replace whitespace with a dash', function () {
            expect(gc.toSlug('foo bar')).toEqual('foo-bar');
        });

        it('must replace sequences of characters outside /a-z0-9\-_/ with a dash', function () {
            expect(gc.toSlug('a±!@#$%^&*b')).toEqual('a-b');
        });

        it('must replace multiple dashes with a single dash', function () {
            expect(gc.toSlug('a---b--c')).toEqual('a-b-c');
        });

        it('must trim dashes from the beginning and end', function () {
            expect(gc.toSlug('-a-')).toEqual('a');
        });
    });

    describe('.scrollTop()', function () {
        it('must return $(window).scrollTop()', function () {
            expect(gc.scrollTop()).toEqual($(window).scrollTop());
        });

        describe('when gc._scrollTop is set', function () {
            beforeEach(function () {
                gc._scrollTop = -1;
            });

            it('must return gc._scrollTop', function () {
                expect(gc.scrollTop()).toEqual(gc._scrollTop);
            });
            
            afterEach(function () {
                gc._scrollTop = undefined;
            });
        });
    });
});

describe('gc', function () {
    beforeEach(function () {
        $('body').html($.parseHTML(__html__['test/fixture/offset.html']));
    });

    describe('.offsetIndex()', function () {
        it('must return the vertical heading offset', function () {
            var headings,
                offsetIndex = []

            headings = gc.getHeadings($('body #vertical-offset'));
            
            gc.offsetIndex(headings).map(function (record) {
                offsetIndex.push(record.offset);
            });

            expect(offsetIndex).toEqual([0, 550, 1100, 1650]);
        });

        it('must return the vertical heading offset minus the deductOffset', function () {
            var headings,
                offsetIndex = []

            headings = gc.getHeadings($('body #vertical-offset'));
            
            gc.offsetIndex(headings, 100).map(function (record) {
                offsetIndex.push(record.offset);
            });

            expect(offsetIndex).toEqual([-100, 450, 1000, 1550]);
        });

        it('must return the vertical heading offset including padding', function () {
            var headings,
                offsetIndex = []

            headings = gc.getHeadings($('body #vertical-offset-padding'));
            
            gc.offsetIndex(headings).map(function (record) {
                offsetIndex.push(record.offset);
            });

            expect(offsetIndex).toEqual([000, 650, 1300, 1950]);
        });

        /*it('must return the vertical heading offset including margin', function () {
            var headings,
                offsetIndex = []

            headings = gc.getHeadings($('body #vertical-offset-margin'));

            gc.offsetIndex(headings).map(function (record) {
                offsetIndex.push(record.offset);
            });

            //expect(offsetIndex).toEqual([500, 1050, 1700, 2350]);
        });*/
    });

    describe('.getInOffsetIndex()', function () {
        var offsetIndex;

        beforeEach(function () {
            offsetIndex = gc.offsetIndex(gc.getHeadings($('body #get-in-offset-index')));
        });

        it('must return the first offsetIndex record when the scrollTop is smaller than the offset of the first record', function () {
            expect(gc.getInOffsetIndex(offsetIndex[0].offset - 100, offsetIndex).element.index()).toEqual(0);
        });

        it('must return the first offsetIndex record when the scrollTop is equal to the offset of the first record', function () {
            expect(gc.getInOffsetIndex(offsetIndex[0].offset, offsetIndex).element.index()).toEqual(0);
        });

        it('must return the first offsetIndex record when the scrollTop is greater than the offset of the first record and lesser than the second record offset', function () {
            var testValue = offsetIndex[0].offset + 100;

            if (testValue > offsetIndex[1].offset) {
                throw new Error('Invalid fixture.');
            }

            expect(gc.getInOffsetIndex(testValue, offsetIndex).element.index()).toEqual(0);
        });

        it('must return the last offsetIndex record when the scrollTop is greater than the offset of the last record', function () {
            expect(gc.getInOffsetIndex(offsetIndex[offsetIndex.length - 1].offset + 100, offsetIndex).element.index()).toEqual(offsetIndex.length - 1);
        });
    });
});